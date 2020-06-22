let cy = null;
let posShacl = null;
let origShacl = null;
let origProp = null;
let globalPos = null;
let nodes = new Map();
let prefixes = new Map();
let systemId = 0;

function generateId() {
	let sparql = "SELECT (max(?vmax) as ?rmax) WHERE { graph <http://example.org/> { ?s ?p ?vmax . FILTER regex(str(?p), \"shacleditor#id\") }}";
	executeSparql(sparql);
	const rSparql = retSparql[0]['rmax']['value'];
	systemId = parseInt(rSparql) + 1;
	executeSparql("insert data { graph <http://example.org/> { <urn:shacleditor> <http://shacleditor#id> "+systemId+" } }");
}

function loadProject(){
	const systemID_old = systemId;
	systemId = document.getElementById("txtIdProject").value;
	const txtTriples = document.getElementById("txtLoad").value;
	if (loadNodes(txtTriples)){
		updateUI();
	} else {
		systemId = systemID_old;
	}
}

function saveProject(){
	if(systemId > 0) {
		deleteAll();
	}
	const allNodes = nodes.keys();
	for (const id of allNodes) {
		if (typeof (nodes.get(id)) === 'object') {
			const classObj = nodes.get(id);
			if(systemId < 0){
				generateId();
			}
			classObj.setId(systemId);
			insert(classObj);
		}
	}
	alert("Project ID: " + systemId);
	//systemId = -1;
}

document.addEventListener('DOMContentLoaded', function() {
	prefixes = fillPrefixes();
	cy = window.cy = cytoscape({
			container : document.getElementById('cy'),

			style : [ {
				selector : 'node[type="class"]',
				style : {
					'label' : 'data(label)',
					'width' : '60px',
					'height' : '60px',
					'color' : 'blue',
					'background-fit' : 'contain',
					'background-clip' : 'none'
				}
			}, {
				selector: 'node[type="shacl"]',
				style: {
					'shape': 'triangle',
					'background-color': 'red',
					'label' : 'data(label)',
					'width' : '60px',
					'height' : '60px',
					'color' : 'blue',
					'background-fit' : 'contain',
					'background-clip' : 'none'
				}
			}, {
				selector: 'node[type="property"]',
				style: {
					'shape': 'round-rectangle',
					'background-color': 'green',
					'label' : 'data(label)',
					'width' : '100px',
					'height' : '20px',
					'color' : 'blue',
					'background-fit' : 'contain',
					'background-clip' : 'none'
				}
			}, {
				selector : 'edge',
				style : {
					'label' : 'data(label)',
					'text-background-color' : 'yellow',
					'text-background-opacity' : 0.4,
					'width' : '6px',
					'target-arrow-shape' : 'triangle',
					'control-point-step-size' : '140px'
				}
			} ],
			layout : {
				name: 'circle'
			},

			elements : {
				nodes : [],
				edges : []
			},
		});

		let options = {
			name: 'circle'
		};

		cy.on('add', 'node', function(evt) {
			cy.layout( options ).run();
			cy.fit();
		});

		cy.on('click', 'node', function(evt) {
			//console.log(evt)
			printSelected();
		});

		var selectAllOfTheSameType = function(ele) {
			cy.elements().unselect();
			if (ele.isNode()) {
				cy.nodes().select();
			} else if (ele.isEdge()) {
				cy.edges().select();
			}
		};
		var unselectAllOfTheSameType = function(ele) {
			if (ele.isNode()) {
				cy.nodes().unselect();
			} else if (ele.isEdge()) {
				cy.edges().unselect();
			}
		};

		var removed;
		var removedSelected;
		var pos;
		var orig;
		var idnew;

		// demo your core ext
		var contextMenu = cy.contextMenus({
			menuItems : [
				{
				id : 'addShaclShape',
				content : 'addShaclShape',
				selector : 'node',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origShacl = orig;
					test = pos;
					clearForm(["txtShClassName"]);
					showDiv("addShDiv");
				},
				hasTrailingDivider : true
			}, {
				id : 'addProp',
				content : 'add Property - RDF Term',
				selector : 'node',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origProp = orig;
					test = pos;
					clearForm(["txtProp","txtValue"]);
					showDiv("addPropDiv");
				},
				hasTrailingDivider : true
			}, {
				id : 'addShConstraint',
				content : 'add SHACL constraint',
				selector : 'node[type="shacl"]',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origProp = orig;
					test = pos;
					clearForm(["txtShProp"]);
					showDiv("addShConstraint");
				},
				hasTrailingDivider : true
			}, {
				id : 'editClass',
				content : 'Edit',
				selector : 'node[type="shacl"], node[type="class"], node[type="property"]',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origProp = orig;
					test = pos;
					//clearForm(["txtShProp"]);
					let targetClass = orig.id();
					const indStr = targetClass.indexOf(";");
					if(indStr > 0){
						targetClass = targetClass.substr(indStr+1);
					}

					const ttl = nodes.get(targetClass);
					const classText = "" + ttl.printText();
					try {
						const className = ttl.className;
						if (classText.includes("sh:targetClass") || classText.includes("NodeShape")) {
							document.getElementById("txtEdTargetClassName").value = ttl.getTargetClass();
							const container = document.getElementById("containerShacl");
							// Clear previous contents of the container
							while (container.hasChildNodes()) {
								container.removeChild(container.lastChild);
							}

							var html = "";
							const get_keys = ttl.getProperties().keys();
							for (const prop of get_keys)
							{
								const get_values = ttl.getProperties().get(prop);
								let vTxtArea = "";
								for (var value of get_values){
									vTxtArea += value;
								}
								html+="<textarea rows=\"3\" cols=\"100\" spellcheck=\"false\" class=\"shprop\" id=\"txtAEdShProp\" name=\"txtAEdShProp\">"+vTxtArea+"</textarea>";
							}

							const propNames = nodes.get(ttl.getTargetClass()).getProperties().keys();
							for (const prop of propNames)
							{
								if(!html.includes(prop)){
									html+="<br><button id=\"btnAddConstr\" class=\"button\" onclick=\"newConstr('"+prop+"', 'divEditShacl');\">"+prop+" +</button>";
								}
							}

							container.innerHTML=html;
							showDiv("divEditShacl");
						} else {
							document.getElementById("txtEdClassName").value = ttl.getClassName();
							document.getElementById("txtEdClassExtend").value = ttl.getClassExtend();
							// Container <div> where dynamic content will be placed
							const container = document.getElementById("container");
							// Clear previous contents of the container
							while (container.hasChildNodes()) {
								container.removeChild(container.lastChild);
							}

							var html = "";
							const get_keys = ttl.getProperties().keys();
							for (const prop of get_keys)
							{
								html+="<input type='text' id='prop' onfocus='makeAutoComplete(this.id);' value='"+prop+"' class='prop' />";
								html+="<input type='text' id='value' onfocus='makeAutoComplete(this.id);' value='"+ttl.getProperties().get(prop)+"' class='value' />";
							}
							container.innerHTML=html;
							showDiv("divEditClass");
						}
					} catch (err) {
						//document.getElementById("txtShacl").innerHTML = err.message;
						console.log(err);
					}
				},
				hasTrailingDivider : true
			}, {
				id : 'remove',
				content : 'remove',
				selector : 'node, edge',
				onClickFunction : function(event) {
					var target = event.target || event.cyTarget;
					removed = target.remove();
					contextMenu.showMenuItem('undo-last-remove');
				},
				hasTrailingDivider : true
			}, {
				id : 'undo-last-remove',
				content : 'undo last remove',
				selector : 'node, edge',
				show : false,
				coreAsWell : true,
				onClickFunction : function(event) {
					if (removed) {
						removed.restore();
					}
					contextMenu.hideMenuItem('undo-last-remove');
				},
				hasTrailingDivider : true
			}, {
				id : 'hide',
				content : 'hide',
				selector : '*',
				onClickFunction : function(event) {
					var target = event.target || event.cyTarget;
					target.hide();
				},
				disabled : false
			}, {
				id : 'add-class',
				content : 'add class',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origProp = orig;
					globalPos = pos;
					clearForm(["txtClassName"]);
					contextMenu.showMenuItem('addShaclShape');
					showDiv("addDiv");
				}
			}, {
				id : 'remove-selected',
				content : 'remove selected',
				coreAsWell : true,
				show : true,
				onClickFunction : function(event) {
					removedSelected = cy.$(':selected').remove();

					contextMenu.hideMenuItem('remove-selected');
					contextMenu.showMenuItem('restore-selected');
				}
			}, {
				id : 'restore-selected',
				content : 'restore selected',
				coreAsWell : true,
				show : false,
				onClickFunction : function(event) {
					if (removedSelected) {
						removedSelected.restore();
					}
					contextMenu.showMenuItem('remove-selected');
					contextMenu.hideMenuItem('restore-selected');
				}
			}, {
				id : 'select-all-nodes',
				content : 'select all nodes',
				selector : 'node',
				show : true,
				onClickFunction : function(event) {
					selectAllOfTheSameType(event.target || event.cyTarget);

					contextMenu.hideMenuItem('select-all-nodes');
					contextMenu.showMenuItem('unselect-all-nodes');
				}
			}, {
				id : 'unselect-all-nodes',
				content : 'unselect all nodes',
				selector : 'node',
				show : false,
				onClickFunction : function(event) {
					unselectAllOfTheSameType(event.target || event.cyTarget);

					contextMenu.showMenuItem('select-all-nodes');
					contextMenu.hideMenuItem('unselect-all-nodes');
				}
			}, {
				id : 'select-all-edges',
				content : 'select all edges',
				selector : 'edge',
				show : true,
				onClickFunction : function(event) {
					selectAllOfTheSameType(event.target || event.cyTarget);

					contextMenu.hideMenuItem('select-all-edges');
					contextMenu.showMenuItem('unselect-all-edges');
				}
			}, {
				id : 'unselect-all-edges',
				content : 'unselect all edges',
				selector : 'edge',
				show : false,
				onClickFunction : function(event) {
					unselectAllOfTheSameType(event.target || event.cyTarget);

					contextMenu.showMenuItem('select-all-edges');
					contextMenu.hideMenuItem('unselect-all-edges');
				}
			} ]
		});
	});
	function printNodes() {
		const p = JSON.stringify(cy.elements().jsons());
		document.getElementById('txtCode').innerHTML = p;
	}

	function newConstr(prop, oldDiv) {
		//clearForm(["txtShProp"]);
		const modal = document.getElementById(oldDiv);
		modal.style.display = "none";
		document.getElementById("txtShProp").value = prop;
		showDiv("addShConstraint");
	}

	function printSelected() {
		var id = cy.$(':selected').id();
		//console.log(typeof nodes.get(id));
		if(typeof(nodes.get(id)) === 'object'){
			var classText = "" + nodes.get(id).printText();
			try {
				if (classText.includes("sh:targetClass") || classText.includes("NodeShape")) {
					document.getElementById('txtShacl').innerHTML = classText;
				} else {
					document.getElementById('txtCode').innerHTML = classText;
				}
			} catch (err) {
				document.getElementById("report").innerHTML = err.message;
			}
		}
	}
	
	function showDiv(div) {
		var modal = document.getElementById(div);
		modal.style.display = "block";
	}

	function organizeUI() {
		let options = {
			name: 'cola'
		};

		cy.layout( options ).run();
		cy.fit();
	}

	function updateUI() {
		cy.elements().remove();
		const allNodes = nodes.keys();
		for (const id of allNodes){
			if(typeof(nodes.get(id)) === 'object') {
				const classText = "" + nodes.get(id).printText();
				try {
					const className = nodes.get(id).className;
					if (classText.includes("sh:targetClass") || classText.includes("NodeShape")) {
						const targetClass = nodes.get(id).getTargetClass();
						cy.add([
							{ group: 'nodes',
								data: {
									id: targetClass,
									label: targetClass,
									type : 'class'
								}
							} ]);

						cy.add([ {
							group : 'nodes',
							data : {
								id : className,
								label : className,
								type : 'shacl'
							}
						}, {
							group : 'edges',
							data : {
								id : targetClass + '-' + className,
								label : 'validatedBy',
								source : targetClass,
								target : className
							}
						} ]);
					} else {
						const extendClass = nodes.get(id).getClassExtend();
						if((extendClass === undefined) || (extendClass === null) || (extendClass.length < 1)){
							cy.add([
								{ group: 'nodes',
									data: {
										id: className,
										label: className,
										type : 'class'
									}
								} ]);
						} else {
						    cy.add([
                            { group: 'nodes',
                                data: {
                                    id: extendClass,
                                    label: extendClass,
                                    type : 'class'
                                }
                            } ]);
							cy.add([
								{ group: 'nodes',
									data: {
										id: className,
										label: className,
										type : 'class'
									}
								}, {
									group : 'edges',
									data : {
										id : extendClass + '-' + className,
										label : 'instance',
										source : extendClass,
										target : className
									}
								} ]);
						}
						const properties = nodes.get(id).getProperties();
						const get_keys = properties.keys();
						for (const prop of get_keys)
						{
							cy.add([ {
								group : 'nodes',
								data : {
									id : prop + ';' + className,
									label : prop,
									type : 'property'
								}
							}, {
								group : 'edges',
								data : {
									id : prop + '-' + className,
									label : 'property',
									source : className,
									target : prop + ';' + className
								}
							} ]);
							//lines.push(prop + " " + properties.get(prop) + " ;");
						}
					}
				} catch (err) {
					//document.getElementById("txtShacl").innerHTML = err.message;
					console.log(err);
				}
			}
		}
	}

	function saveClass() {
		const className = document.getElementById("txtEdClassName").value;
		classExtend = document.getElementById("txtEdClassExtend").value;
		let ttl = nodes.get(className);
		const props = document.getElementById("container").querySelectorAll(".prop");
		const values = document.getElementById("container").querySelectorAll(".value");
		//const values = document.getElementById("divEditClass").querySelectorAll(".value");
		if(ttl === undefined){
			alert("NEW class? something wrong !!! Open issue !!!");
			ttl = new Turtle(className, classExtend);
		} else {
			ttl.getProperties().clear();
			if(classExtend.length > 0){
				let ttlExtend = nodes.get(classExtend);
				if(ttlExtend != undefined) {
					addAll(ttl.getProperties(), ttlExtend.getProperties());
				}
			}
			ttl.setClassExtend(classExtend);

			let i;
			for (i = 0; i < props.length; i++) {
				ttl.getProperties().set(props[i].value, values[i].value);
			}
		}
		nodes.set(className,ttl);
		updateUI();
		const modal = document.getElementById("divEditClass");
		modal.style.display = "none";
	}

	var classExtend = null;
	function addClass() {
		const className = document.getElementById("txtClassName").value;
		//classExtend = document.getElementById("txtClassExtend").value;
		const ttl = new Turtle(className, classExtend);
		const txtTurtle = ttl.printText();
		document.getElementById('txtCode').innerHTML = txtTurtle;
		let myX, myY;
		if(globalPos === null){
			myX = 100;
			myY = 100;
		} else {
			myX = globalPos.x;
			myY = globalPos.y;
		}
		var eles = cy.add([
		  { group: 'nodes',
			  data: {
		  		id: className,
			  	label: className,
			  	type : 'class'
			  },
			  position: { x: myX, y: myY } }
		]);
		nodes.set(className, ttl);
		var modal = document.getElementById("addDiv");
	  	modal.style.display = "none";
	}
	
	// When the user clicks on <span> (x), close the modal
	function spanClick(div) {
		var modal = document.getElementById(div);
	  	modal.style.display = "none";
	}

	function addProp(){
		const pos = origProp.position;
		const orig = origProp;
		const targetClass = orig.id();
		const prop = document.getElementById("txtProp").value;
		const value = document.getElementById("txtValue").value;

		const classObj = nodes.get(targetClass);
		classObj.addProperty(prop,value);

		const txtTurtle = classObj.printText();
		document.getElementById('txtCode').innerHTML = txtTurtle;
		nodes.set(classObj.getClassName(), classObj);
		updateUI();
		const modal = document.getElementById("addPropDiv");
		modal.style.display = "none";
	}

	function saveShacl(){
		const orig = origProp;
		const shaclClass = orig.id();
		const targetClass = document.getElementById("txtEdTargetClassName").value;
		const ttl = nodes.get(shaclClass);
		//const props = document.getElementsByClassName("shprop");
		const props = document.getElementsByName("txtAEdShProp");
		ttl.setTargetClass(targetClass);
		ttl.getProperties().clear();
		for (let prop of props)
		{
			const propName = "" + (ttl.properties.size + 1);
			ttl.addProperty(propName);
			ttl.setPropertyValues(propName, [prop.value]);
		}

		const txtTurtle = ttl.printText();
		document.getElementById('txtShacl').innerHTML = txtTurtle;
		nodes.set(shaclClass, ttl);
		const modal = document.getElementById("divEditShacl");
		modal.style.display = "none";
	}

	/*
	Suggest a Shacl constraint according to the type and name of the property.
	 */
	function getSugByType(prop) {
		const sparql = "Select ?o where { graph <http://shacleditor#"+systemId+"> { ?s <"+prop+"> ?o} }";
		executeSparql(sparql);
		const rValue = retSparql[0]['o']['value'];
		const rType = retSparql[0]['o']['type'];
		let sugg = "";
		let propLow = "";
		if(Array.isArray(prop)){
			propLow = prop[0].toLowerCase();
		} else {
			propLow = prop.toLowerCase();
		}
		if(rType.includes("literal")){
			//if(isDate(rSparql)){
			if(propLow.includes("date")){
				sugg = "sh:path schema:birthDate ;\n" +
					"sh:lessThan schema:deathDate ;\n" +
					"sh:maxCount 1 ;";
			}
			if(propLow.includes("gender")){
				sugg = "sh:path schema:gender ;\n" +
					"sh:in ( \"female\" \"male\" ) ;";
			}
		} else {
			//URI

		}
		return sugg;
	}

	/*
	Add a suggestion for a shacl constraint.
	 */
	function sugShConstraint(){
		const value = [document.getElementById("txtShProp").value];
		const suggestion = getSugByType(value);
		document.getElementById("txtShProp").value = suggestion;
	}

	function addShConstraint(){
		var pos = origProp.position;
		var orig = origProp;
		var targetClass = orig.id();
		//var targetClass = classExtend;
		var value = [document.getElementById("txtShProp").value];

		var classObj = nodes.get(targetClass);
		const propName = "" + (classObj.properties.size + 1)
		classObj.addProperty(propName);
		classObj.setPropertyValues(propName, value);

		var txtTurtle = classObj.printText();
		document.getElementById('txtShacl').innerHTML = txtTurtle;
		var modal = document.getElementById("addShConstraint");
		modal.style.display = "none";
	}

	function addShacl(){
		var pos = origShacl.position;
		var orig = origShacl;
		
		var className = document.getElementById("txtShClassName").value;
		//var targetClass = orig.id();
		var targetClass = orig.id();
		var shacl = new ShaclData(className, targetClass);

		var txtShacl = shacl.printText();
		document.getElementById('txtShacl').innerHTML = txtShacl;
		nodes.set(className, shacl);
		updateUI();
		var modal = document.getElementById("addShDiv");
	  	modal.style.display = "none";
	}
	
	function makeValidation(){
		let validator = new SHACLValidator();
        validate();

        $('#txtShacl').bind('input propertychange', function () {
            let text = $("#txtShacl").val();
            validator.parseShapesGraph(text, 'text/turtle', function () {
                console.log("successfully parsed shape graph");
                validate();
            })
        });


        $('#txtCode').bind('input propertychange', function () {
            let text = $("#txtCode").val();
            validator.parseDataGraph(text, 'text/turtle', function () {
                console.log("successfully parsed data graph");
                validate();
            });
        });


        function validate() {
            let data_text = $("#txtCode").val();
            let shapes_text = $("#txtShacl").val();

            validator.validate(data_text, 'text/turtle', shapes_text, 'text/turtle', function (e, report) {
                let $report = $("#report");
                $report.val("Conforms? " + report.conforms() + "\n\n");

                if (report.conforms() === false) {
                    report.results().forEach(function (result) {
                        $report.val($report.val() + JSON.stringify(result) + "\n\n");
                    });
                }
            });
        }
	}