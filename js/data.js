var retSparql = null;

function executeSparql(queryStr) {
    const endpoint = "http://localhost:8080/sparql/master";
    var querypart = "";
    var xmlhttp = null;
    var ret = null;

    // Get our HTTP request object.
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Code for older versions of IE, like IE6 and before.
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert('Perhaps your browser does not support XMLHttpRequests?');
    }

    xmlhttp.open('POST', endpoint, false); // GET can have caching probs, so POST
    if(queryStr.includes("insert") || queryStr.includes("update")){
        querypart = queryStr;
        xmlhttp.setRequestHeader('Content-type', 'application/sparql-update');
    } else {
        querypart = "query=" + encodeURI(queryStr);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.setRequestHeader("Accept", "application/sparql-results+json");
    }

    // Set up callback to get the response asynchronously.
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Process the results
                if(queryStr.includes("insert") || queryStr.includes("update")){
                    retSparql = "true"
                } else {
                    retSparql = JSON.parse(xmlhttp.responseText)['results']['bindings'];
                }
            } else {
                // Some kind of error occurred.
                console.log(queryStr);
                retSparql = "Sparql query error: " + xmlhttp.status + " " + xmlhttp.responseText + "\nQuery: " + queryStr;
            }
        }
    };
    xmlhttp.send(querypart);
    //return "-1";
}

function insert(classObj) {
    const classText = classObj.printText();
    const sparqlInsert = classObj.generateInsert();
    executeSparql(sparqlInsert);
    if(!retSparql.includes("true")){
        alert(retSparql);
    }
}

function loadNodes() {
    //systemId = -1;
    let qSparql = "select ?s ?p ?o where { graph <http://shacleditor#"+systemId+"> { ?s ?p ?o} }"
    executeSparql(qSparql);
    let elems = retSparql;

    for (let i = 0; i < elems.length; i++) {
        let s = elems[i]['s']['value'];
        let p = elems[i]['p']['value'];
        let o = elems[i]['o']['value'];

        if(o.includes("http://www.w3.org/2000/01/rdf-schema#Class")){
            qSparql = "select ?s ?p ?o where { graph <http://shacleditor#"+systemId+"> { ?s ?p ?o . FILTER (?s=<"+s+"> || ?o=<"+s+">) } }";
            executeSparql(qSparql);
            let classElems = retSparql;
            const objRDF = new Turtle(s, null);
            for (let j = 0; j < classElems.length; j++) {
                let sClass = classElems[j]['s']['value'];
                let pClass = classElems[j]['p']['value'];
                let oClass = classElems[j]['o']['value'];
                // Load only things from this class
                if (pClass.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#subClassOf")) {
                    if(oClass.localeCompare(s) != 0){
                        objRDF.setClassExtend(oClass);
                    }
                }

                if (pClass.includes("http://shacleditor/hasProperty")) {
                    objRDF.addProperty(oClass, null);
                }
            }
            nodes.set(objRDF.getClassName(), objRDF);
        }
    }

    let objShacl = new ShaclData(null, null);
    for (let i = 0; i < elems.length; i++) {
        let s = elems[i]['s']['value'];
        let p = elems[i]['p']['value'];
        let o = elems[i]['o']['value'];

        if(p.includes("http://www.w3.org/ns/shacl#targetClass")){
            //objShacl.setTargetClass(o);

            qSparql = "select ?s ?p ?o where { graph <http://shacleditor#"+systemId+"> { ?s ?p ?o . FILTER (?s=<"+s+"> || ?o=<"+s+">) } }";
            executeSparql(qSparql);
            let classElems = retSparql;
            console.log(classElems);
            const objShacl = new ShaclData(s, o);
            /*for (let j = 0; j < classElems.length; j++) {
                let sClass = classElems[j]['s']['value'];
                let pClass = classElems[j]['p']['value'];
                let oClass = classElems[j]['o']['value'];
                // Load only things from this class
                if (pClass.includes("http://shacleditor/hasProperty")) {
                    objShacl.addProperty(oClass, null);
                }
            }*/
            console.log(objShacl);
            nodes.set(objShacl.getClassName(), objShacl);

        }

        /*if(o.includes("http://www.w3.org/ns/shacl#NodeShape")){
            objShacl.setClassName(s);
            nodes.set(objShacl.getClassName(), objShacl);
        }*/
    }
    
    const modal = document.getElementById("divLoadProject");
    modal.style.display = "none";
    return (nodes.size > 0);
}

