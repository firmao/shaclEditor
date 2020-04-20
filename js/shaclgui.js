	var cy = null;
	var posShacl = null;
	var origShacl = null;
	var origProp = null;
	let globalPos = null;
	var nodes = new Map();

	document.addEventListener('DOMContentLoaded', function() {
		cy = window.cy = cytoscape({
			container : document.getElementById('cy'),

			style : [ {
				selector : 'node',
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
				selector: 'node[type="mouse"]',
				style: {
					'shape': 'square',
					'background-color': 'blue'
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
				name : 'breadthfirst'
			},

			elements : {
				nodes : [],
				edges : []
			},
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
					//alert("Need to create addPropDiv");
					clearForm(["txtProp","txtValue"]);
					showDiv("addPropDiv");
				},
				hasTrailingDivider : true
			}, {
				id : 'addShConstraint',
				content : 'add SHACL constraint',
				selector : 'node',
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
				selector : 'node',
				coreAsWell : true,
				onClickFunction : function(event) {
					pos = event.position || event.cyPosition;
					orig = event.target || event.cyTarget;
					origProp = orig;
					test = pos;
					//clearForm(["txtShProp"]);
					const targetClass = orig.id();
					const ttl = nodes.get(targetClass);
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
						/*const inputProp = document.createElement("input");
						inputProp.type = "text";
						inputProp.name = prop;
						inputProp.value = prop;
						container.appendChild(inputProp);

						const inputValue = document.createElement("input");
						inputValue.type = "text";
						inputValue.name = ttl.getProperties().get(prop);
						inputValue.value = ttl.getProperties().get(prop);
						container.appendChild(inputValue);
						container.appendChild(document.createElement("br"));*/

						html+="<input type='text' id='prop' value='"+prop+"' class='prop' />";
						html+="<input type='text' id='value' value='"+ttl.getProperties().get(prop)+"' class='value' />";
						//container.innerHTML="<input type='text' id='bb' value='"+ttl.getProperties().get(prop)+"' class='value' />";
						//container.innerHTML="<input type='text' id='aa' value='"+prop+"' class='prop' />";
						//container.innerHTML="<input type='text' id='bb' value='"+ttl.getProperties().get(prop)+"' class='value' />";
						//container.appendChild(document.createElement("br"));
					}
					container.innerHTML=html;
					showDiv("divEditClass");
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
					clearForm(["txtClassName", "txtClassExtend"]);
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
	
	function printSelected() {
		var id = cy.$(':selected').id();
		//console.log(typeof nodes.get(id));
		if(typeof(nodes.get(id)) === 'object'){
			var classText = "" + nodes.get(id).printText();
			try {
				if (classText.includes("sh:")) {
					document.getElementById('txtShacl').innerHTML = classText;
				} else {
					document.getElementById('txtCode').innerHTML = classText;
				}
			} catch (err) {
				document.getElementById("txtShacl").innerHTML = err.message;
			}
		}
	}
	
	function showDiv(div) {
		var modal = document.getElementById(div);
		modal.style.display = "block";
	}

	function saveClass() {
		const className = document.getElementById("txtEdClassName").value;
		classExtend = document.getElementById("txtEdClassExtend").value;
		let ttl = nodes.get(className);
		console.log(ttl);
		const props = document.getElementById("container").querySelectorAll(".prop");
		const values = document.getElementById("container").querySelectorAll(".value");
		//const values = document.getElementById("divEditClass").querySelectorAll(".value");
		if(ttl === undefined){
			alert("NEW class? something wrong !!! Open issue !!!");
			ttl = new Turtle(className, classExtend);
		} else {
			ttl.getProperties().clear();
			let i;
			for (i = 0; i < props.length; i++) {
				ttl.getProperties().set(props[i].value, values[i].value);
			}
		}
		nodes.set(className,ttl);
		const modal = document.getElementById("divEditClass");
		modal.style.display = "none";
	}

	var classExtend = null;
	function addClass() {
		const className = document.getElementById("txtClassName").value;
		classExtend = document.getElementById("txtClassExtend").value;
		const ttl = new Turtle(className, classExtend);
		const txtTurtle = ttl.printText();
		document.getElementById('txtCode').innerHTML = txtTurtle;
		console.log(globalPos);
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
		var pos = origProp.position;
		var orig = origProp;
		var targetClass = orig.id();
		//var targetClass = classExtend;
		var prop = document.getElementById("txtProp").value;
		var value = document.getElementById("txtValue").value;

		var classObj = nodes.get(targetClass);
		console.log(typeof classObj);
		classObj.addProperty(prop,value);

		var txtTurtle = classObj.printText();
		document.getElementById('txtCode').innerHTML = txtTurtle;
		var modal = document.getElementById("addPropDiv");
		modal.style.display = "none";
	}

	function addShConstraint(){
		var pos = origProp.position;
		var orig = origProp;
		var targetClass = orig.id();
		//var targetClass = classExtend;
		var value = [document.getElementById("txtShProp").value];

		var classObj = nodes.get(targetClass);
		console.log(classObj.properties.size);
		const propName = "" + (classObj.properties.size + 1)
		classObj.addProperty(propName);
		classObj.setPropertyValues(propName, value);

		var txtTurtle = classObj.printText();
		document.getElementById('txtCode').innerHTML = txtTurtle;
		var modal = document.getElementById("addShConstraint");
		modal.style.display = "none";
	}

	function addShacl(){
		var pos = origShacl.position;
		var orig = origShacl;
		
		var className = document.getElementById("txtShClassName").value;
		//var targetClass = orig.id();
		var targetClass = classExtend;
		var shacl = new ShaclData(className, targetClass);

		var txtShacl = shacl.printText();
		document.getElementById('txtShacl').innerHTML = txtShacl;
		
		cy.add([ {
			group : 'nodes',
			data : {
				id : className,
				label : className,
				type : 'shacl'
			},
			position : {
				x : 400,
				y : 100
			}
		}, {
			group : 'edges',
			data : {
				id : orig.id() + '-' + className,
				label : 'validatedBy',
				source : orig.id(),
				target : className
			}
		} ]);

		nodes.set(className, shacl);
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