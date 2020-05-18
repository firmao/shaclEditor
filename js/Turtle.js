class Turtle {

	constructor(className, extendClass)
	{
		this.id = systemId;
		this.className = className;
		this.extendClass = extendClass;
		this.properties = new Map();
		this.prefixes = fillPrefixes();
	}

	getId(){
		return this.id;
	}

	setId(id){
		this.id = id;
	}

	getClassName(){
		return this.className;
	}

	getClassExtend(){
		return this.extendClass;
	}

	setClassExtend(extendClass){
		this.extendClass = extendClass;
	}

	addProperty(property, value){
		this.properties.set(property, value);
	}

	getProperties(){
		return this.properties;
	}

	setProperties(properties){
		this.properties = properties;
	}

	getPrefixes(){
		return this.prefixes;
	}
	setPrefixes(prefixes){
		this.prefixes = prefixes;
	}

	getTurtleLines(){
		const lines = [];

		/*lines.push("@prefix ex: <http://example.org/ns#> .");
		lines.push("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
		lines.push("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
		lines.push("@prefix schema: <http://schema.org/> .");
		lines.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");*/

		const preNames = this.prefixes.keys();
		for (const name of preNames)
		{
			lines.push("@prefix " + name + ": <" + this.prefixes.get(name) + "> .");
		}


		if((this.extendClass != undefined) && (this.extendClass != null)) {
			if (this.extendClass.length > 0) {
				lines.push(this.className + " a " + this.extendClass + " ; rdfs:label \""+getURLName(this.className)+"\" .");
			}
		} else {
			if(this.className.includes("http")){
				lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://www.w3.org/2000/01/rdf-schema#Class> . ");
				lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(this.className)+"\" . ");
			} else {
				lines.push(this.className + " a rdfs:Class ; rdfs:label \""+getURLName(this.className)+"\" .");
			}
		}

		const get_keys = this.properties.keys();
		for (const prop of get_keys)
		{
			if(prop.includes("http")){
				lines.push("<" + prop + "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(prop)+"\" .");
			} else {
				lines.push(prop + " a rdf:Property ; rdfs:label \"" + getURLName(prop) + "\" .");
			}
		}

		return lines;
	}

	printText(){
		let res = "";
		const lines = this.getTurtleLines();
		for (var line of lines)
		{
			res += "\n" + line;
			//console.log(line);
		}
		res = res.trim();
		if(this.properties.size > 0){
			res = res.substring(0, res.length-2) + ".";
		}
		return res;
	}
}