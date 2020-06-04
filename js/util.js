function clearForm(fields) {
    for (const field of fields) {
        document.getElementById(field).value = "";
    }
}

// Add any Map or Set to another
function addAll(target, source) {
    if (target instanceof Map) {
        Array.from(source.entries()).forEach(it => target.set(it[0], it[1]))
    } else if (target instanceof Set) {
        source.forEach(it => target.add(it))
    }
}

function fillPrefixes(){
    prefixes = new Map();
    prefixes.set("ex","http://example.org/ns#");
    prefixes.set("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    prefixes.set("rdfs","http://www.w3.org/2000/01/rdf-schema#");
    prefixes.set("schema","http://schema.org/");
    prefixes.set("xsd","http://www.w3.org/2001/XMLSchema#");
    prefixes.set("dash","http://datashapes.org/dash#");
    prefixes.set("sh","http://www.w3.org/ns/shacl#");

    return prefixes;
}

const prefixesMap = new Map();

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + prefixesMap.get(arr[i]) + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

function makeAutoComplete(field) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);

            for (let [key, value] of Object.entries(myObj['@context'])) {
                prefixesMap.set(key, value);
            }
            //document.getElementById("demo").innerHTML = Object.keys(myObj['@context']);
            let arrNames = Array.from(prefixesMap.keys());
            autocomplete(document.getElementById(field), arrNames);

        }
    };
    xmlhttp.open("GET", "https://prefix.cc/context", true);
    xmlhttp.send();
}

function getURLName(url) {
    if(url.includes("http")){
        const indexS = url.split("/").length;
        const sRet = url.split("/")[indexS - 1].replace("#", "");
        return sRet;
    } else {
        return url.split(':')[1];
    }
}

function checkFirstVisit() {
    systemId = -1;
    if(document.cookie.indexOf('mycookie')==-1) {
        // cookie doesn't exist, create it now
        document.cookie = 'mycookie=1';
    }
    else {
        // not first visit, so alert
        alert('You refreshed!');
    }
}