function executeSparql(queryStr) {
    const endpoint = "http://localhost:8080/sparql/master";
    var querypart = "";
    var xmlhttp = null;

    // Get our HTTP request object.
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Code for older versions of IE, like IE6 and before.
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert('Perhaps your browser does not support XMLHttpRequests?');
    }

    xmlhttp.open('POST', endpoint, true); // GET can have caching probs, so POST
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
                //document.write(xmlhttp.responseText);
                return xmlhttp.responseText;
                //callback(xmlhttp.responseText);
            } else {
                // Some kind of error occurred.
                return "Sparql query error: " + xmlhttp.status + " " + xmlhttp.responseText;
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
    var rSparql = executeSparql(qSparql);

    console.log("IMPLEMENT THE LOAD NODES !!!");
    console.log(rSparql);
    /*let classObj = new Turtle("classTest", "");
    let shcl = new ShaclData("shTest", "classTest");
    nodes.set("classTest", classObj);
    nodes.set("shTest", shcl);*/
    
    const modal = document.getElementById("divLoadProject");
    modal.style.display = "none";
    return (nodes.size > 0);
}

