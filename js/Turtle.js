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

	setClassName(className){
	    this.className = className;
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

		const preNames = this.prefixes.keys();
		for (const name of preNames)
		{
			lines.push("@prefix " + name + ": <" + this.prefixes.get(name) + "> .");
		}
		console.log(this.className);
		lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://www.w3.org/2000/01/rdf-schema#Class> . ");
		lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(this.className)+"\" . ");

		if((this.extendClass != undefined) && (this.extendClass != null)) {
			if (this.extendClass.length > 0) {
				lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#subClassOf>  <"+this.extendClass+"> . ");
			}
		}

		const get_keys = this.properties.keys();
		for (const prop of get_keys)
		{
			lines.push("<" + prop + "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(prop)+"\" .");
			lines.push("<"+this.className+"> <http://shacleditor/hasProperty> <"+prop+"> .");
			lines.push("<"+this.className+"> <"+prop+"> "+this.properties.get(prop)+"  .");
		}

		return lines;
	}

	generateInsert(){
		const lines = [];
		//systemId = -1;
		const preNames = this.prefixes.keys();
		for (const name of preNames)
		{
			lines.push("prefix " + name + ": <" + this.prefixes.get(name) + "> ");
		}
		lines.push("insert data { graph <http://shacleditor#"+ this.getId() +"> { ");

		lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://www.w3.org/2000/01/rdf-schema#Class> . ");
		lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(this.className)+"\" . ");

		if((this.extendClass != undefined) && (this.extendClass != null)) {
			if (this.extendClass.length > 0) {
				lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#subClassOf>  <"+this.extendClass+"> . ");
			}
		}

		const get_keys = this.properties.keys();
		for (const prop of get_keys)
		{
			lines.push("<" + prop + "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#label>  \""+getURLName(prop)+"\" .");
			lines.push("<"+this.className+"> <http://shacleditor/hasProperty> <"+prop+"> .");
			//lines.push("<"+this.className+"> <"+prop+"> "+this.properties.get(prop)+"  .");
		}

		let res = "";
		lines.push("} }");
		for (const line of lines)
		{
			res += "\n" + line;
		}
		res = res.trim();
		return res;
	}

	printText(){
		let res = "";
		const lines = this.getTurtleLines();
		for (var line of lines)
		{
			res += "\n" + line;
		}
		res = res.trim();
		if(this.properties.size > 0){
			res = res.substring(0, res.length-2) + ".";
		}
		return res;
	}
}