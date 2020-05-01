class ShaclData { 

	constructor(className, targetClass) 
	{ 
		this.className = className;
		this.targetClass = targetClass;
		this.properties = new Map();
	}

	getClassName(){
		return this.className;
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
	
	setPropertyValues(property, value){
		this.properties.get(property).push(value);
	}
	
	getShaclLines(){
		var lines = [];
		lines.push("@prefix dash: <http://datashapes.org/dash#> .");
		lines.push("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
		lines.push("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
		lines.push("@prefix schema: <http://schema.org/> .");
		lines.push("@prefix sh: <http://www.w3.org/ns/shacl#> .");
		lines.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");
		
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