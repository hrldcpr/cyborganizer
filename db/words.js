{
	"_id": "_design/words",
	"_rev": "1-28afb0efffc2a4920d265c43b3d0d6bc",
	"views": {
		"all": {
			"map": "function(doc) {if (!doc.content.text) return; var words = doc.content.text.toLowerCase().split(/\\W+/).sort(); var i=0; while(i<words.length) {var j=i; do {i++;} while(i<words.length && words[i]===words[j]); if(words[j]) emit(words[j], i-j);}}"
		},
		"counts": {
			"map": "function(doc) {if (!doc.content.text) return; var words = doc.content.text.toLowerCase().split(/\\W+/).sort(); var i=0; while(i<words.length) {var j=i; do {i++;} while(i<words.length && words[i]===words[j]); if(words[j]) emit(words[j], i-j);}}",
			"reduce": "function(keys, values) {return sum(values);}"
		}
	}
}