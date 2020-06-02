class ShaclData { 

	constructor(className, targetClass) 
	{
		this.id = systemId;
		this.className = className;
		this.targetClass = targetClass;
		this.properties = new Map();
		this.prefixes = fillPrefixes();
	}

	getId(){
		return this.id;
	}
//systemId = -1;
	setId(id){
		this.id = id;
	}

	getClassName(){
		return this.className;
	}

    setClassName(className){
        this.className = className;
    }

	getTargetClass(){
		return this.targetClass;
	}

	setTargetClass(targetClass){
		this.targetClass = targetClass;
	}

	getProperties(){
		return this.properties;
	}

	addProperty(property){
		this.properties.set(property, []);
	}

	getPrefixes(){
		return this.prefixes;
	}
	setPrefixes(prefixes){
		this.prefixes = prefixes;
	}

	setPropertyValues(property, value){
		this.properties.get(property).push(value);
	}
	
	getShaclLines(){
		var lines = [];
		/*lines.push("@prefix dash: <http://datashapes.org/dash#> .");
		lines.push("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
		lines.push("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
		lines.push("@prefix schema: <http://schema.org/> .");
		lines.push("@prefix sh: <http://www.w3.org/ns/shacl#> .");
		lines.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");*/

		const preNames = this.prefixes.keys();
		for (const name of preNames)
		{
			lines.push("@prefix " + name + ": <" + this.prefixes.get(name) + "> .");
		}
		
		lines.push(this.className);
		lines.push("a sh:NodeShape ;");
		lines.push("sh:targetClass "+this.targetClass+" ;");
		var get_keys = this.properties.keys(); 

		for (var prop of get_keys) 
		{ 
			lines.push("sh:property [");
			var get_values = this.properties.get(prop); 
			for (var value of get_values){
				lines.push(value);
			}  
			lines.push(" ] ;");
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
		if(this.className.includes("http")){
			lines.push("<" + this.className + ">" + " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>  <http://www.w3.org/ns/shacl#NodeShape> . ");
			lines.push("<" + this.className + ">" + " <http://www.w3.org/ns/shacl#targetClass>  <"+this.targetClass+"> . ");
		} else {
			lines.push(this.className + " a sh:NodeShape ; rdfs:label \""+getURLName(this.className)+"\" .");
			lines.push("sh:targetClass "+this.targetClass+" ;");
		}

		const get_keys = this.properties.keys();
		for (const prop of get_keys)
		{
			lines.push("sh:property [");
			const get_values = this.properties.get(prop);
			for (const value of get_values){
				lines.push(value);
			}
			lines.push(" ] ;");
		}

		lines.push("} }");

		let res = "";
		for (const line of lines)
		{
			res += "\n" + line;
		}
		return res.trim();
	}

	printText(){
		var res = "";
		var lines = this.getShaclLines();
		for (var line of lines) 
		{ 
			res += "\n" + line;
		}
		res = res.trim().substring(0, res.length-2) + ".";
		return res;
	}
}