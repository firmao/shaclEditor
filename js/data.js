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
                retSparql = JSON.parse(xmlhttp.responseText);
            } else {
                // Some kind of error occurred.
                retSparql = "Sparql query error: " + xmlhttp.status + " " + xmlhttp.responseText;
            }
        }
    };
    xmlhttp.send(querypart);
    //return "0";
}

function insert(classObj) {
    const classText = classObj.printText();
    // if is a Shacl shape, we should not include in a triple store.
    if (classText.includes("sh:targetClass")) {
        alert("Including SHACL shape (TODO !!!): " + classObj.getClassName());
    } else {
        var sparqlInsert = classObj.generateInsert();
        var retSparql = executeSparql(sparqlInsert);
        alert(retSparql);
    }
}

function loadNodes() {
    //systemId = -1;
    var qSparql = "select ?s ?p ?o where { graph <http://shaclid"+systemId+"> { ?s ?p ?o} }"
    executeSparql(qSparql);
    //console.log(retSparql['results']['bindings'].length);
    let elems = retSparql['results']['bindings'];
    console.log(elems);
    for (let i = 0; i < elems.length; i++) {
        let s = elems[i]['s']['value'];
        let p = elems[i]['p']['value'];
        let o = elems[i]['o']['value'];
        console.log("s: " + s + " p: " + p + " o: " + o);
        let objRDF = new Turtle(null,null);
        if(o.includes("http://www.w3.org/2000/01/rdf-schema#Class")){
            objRDF.setClassName(s);
        }
        if(o.includes("http://www.w3.org/2000/01/rdf-schema#subClassOf")){
            objRDF.setClassExtend(s);
        }

        if(o.includes("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property")){
            objRDF.addProperty(s,null);
        }

        nodes.set(objRDF.getClassName(), objRDF);
    }

    /*let classObj = new Turtle("classTest", "");
    let shcl = new ShaclData("shTest", "classTest");
    nodes.set("classTest", classObj);
    nodes.set("shTest", shcl);*/
    
    const modal = document.getElementById("divLoadProject");
    modal.style.display = "none";
    return (nodes.size > 0);
}

