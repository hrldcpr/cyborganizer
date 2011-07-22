{
	"_id": "_design/things",
	"_rev": "2-c2be765a1f641c7d95cc43df1d36095b",
	"views": {
		"byOwner": {
		    "map": "function(doc) {if(doc.owner) emit(doc.owner,null);}"
		}
	}
}