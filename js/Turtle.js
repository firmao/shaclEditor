class Turtle { 

	constructor(className, extendClass) 
	{ 
		this.className = className;
		this.extendClass = extendClass;
		this.properties = new Map();
	}
	
	addProperty(property, value){
		this.properties.set(property, value);
	}
	
	getTurtleLines(){
		var lines = [];
		
		lines.push("@prefix ex: <http://example.org/ns#> .");
		lines.push("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
		lines.push("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
		lines.push("@prefix schema: <http://schema.org/> .");
		lines.push("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .");
		lines.push(this.className);
		lines.push("a " + this.extendClass + " ;");
		var get_keys = this.properties.keys(); 

		for (var prop of get_keys) 
		{ 
			lines.push(prop + " " + this.properties.get(prop) + " ;"); 
		}
		
		return lines;
	}
	
	printTurtle(){
		var res = "";
		var lines = this.getTurtleLines();
		for (var line of lines) 
		{ 
			res += "\n" + line;
			//console.log(line); 
		}
		res = res.trim().substring(0, res.length-2) + ".";
		return res;
	}
}