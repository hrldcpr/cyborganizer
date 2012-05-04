function cacheDB(db) {
	var DIRTY_KEY = '_dirty';

	function get(key) {
		var val = localStorage.getItem(key);
		if (val)
			return JSON.parse(val);
		else
			return val;
	}

	function set(key, val) {
		localStorage.setItem(key, JSON.stringify(val));
	}

	function unset(key) {
		localStorage.removeItem(key);
	}

	function allIds() {
		var ids = []
		for(var i=0; i<localStorage.length; i++)
			ids.push(localStorage.key(i));
		return ids;
	}

	function getDirtied() {
		var dirtied = get(DIRTY_KEY);
		if (!dirtied)
			dirtied = {};
		return dirtied;
	}

	function dirty(key) {
		var dirtied = getDirtied();
		dirtied[key] = true;
		set(DIRTY_KEY, dirtied);
	}

	function clean() {
		unset(DIRTY_KEY);
	}

	function viewRowsToMap(rows) {
		var result = {};
		$.each(rows.rows, function(i, row) {
			var key = row.key;
			var doc = row.doc;
			if (!result[key])
				result[key] = [];
			result[key].push(doc);
			set(doc._id, doc);
		});
		return result;
	}

	var wrapper = {
		open: function(id) {
			if (navigator.onLine) {
				db.openDoc(id,
					{success: function(doc) {
						if (doc)
							set(id, doc);
						else
							unset(id);
					}},
					{async: false});
			}
			return get(id);
		},

		save: function(doc) {
			if (!doc._id) // always generate _id locally
				doc._id = Math.uuid();
			if (navigator.onLine)
				db.saveDoc(doc, {error: function() {dirty(doc._id);}}); // async
			else
				dirty(doc._id); // cache is now ahead of server
			set(doc._id, doc);
		},

		deleteDoc: function(doc) {
			if (navigator.onLine)
				db.removeDoc(doc, {error: function() {dirty(doc._id);}}); // async
			else
				dirty(doc._id);
			unset(doc._id);
		},

		// allDocs: function(ids) {
		// 	if (navigator.onLine) {
		// 		var rows = db.allDocs({include_docs: true}, ids);
		// 		return viewRowsToMap(rows);
		// 	} else {
		// 		if (!ids)
		// 			ids = allIds();
		// 		var result = [];
		// 		$.each(ids, function(i, id) {
		// 			var doc = get(id);
		// 			if (doc)
		// 				result.push(doc);
		// 		});
		// 		return result;
		// 	}
		// },

		view: function(view, offlineMap, keys) {
			if (navigator.onLine) {
				var options = {include_docs: true};
				if (keys && keys.length===1) // use GET if possible
					options.key = keys[0];
				else
					options.keys = keys;
				var result = null;
				options.success = function(rows) {result = viewRowsToMap(rows)};
				db.view(view, options, {async: false});
				return result;
			} else {
				var result = {};
				var doc;
				function emit(key, value) {
					if (!keys || keys.indexOf(key)>=0) {
						if (value)
							throw "map values not supported by cacheDB";
						if (!result[key])
							result[key] = [];
						result[key].push(doc);
					}
				}
				eval("var map = " + offlineMap); // var map = eval(...); doesn't work, oh well.
				$.each(allIds(), function(i, id) {
					doc = get(id);
					map(doc);
				});
				return result;
			}
		},

		flush: function() {
			if (navigator.onLine) {
				var dirtied = getDirtied();
				$.each(dirtied, function(id) {
					try {
						var doc = get(id);
						if (doc)
							db.saveDoc(doc);
						else
							db.removeDoc(id);
					} catch(e) {
						// probably an update conflict; keep going.
						alert("flushing dirty "+id+" got exception "+JSON.stringify(e));
					}
				});
				clean();
			}
		},

		clearCache: function() {
			localStorage.clear();
		}
	};

	return wrapper;
}
