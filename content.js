const TYPE_TIMEOUT = 1000;

function makeContent() {
    return {
	kind:   'rectangle',
	red:    Math.random(),
	green:  Math.random(),
	blue:   Math.random(),
	text:   ""
    };
}

// OUTPUT ATTRIBUTES:
// .updateContent()
// .showEditor()
// .hideEditor()
// .editorVisible() returns true iff the editor is visible
function makeContentUI(thing) {
    var backgroundText = null;
    var backgroundImage = null;
    var backgroundCheck = null;

    var content = thing.content();

    thing.updateContent = function() {
	thing.div().css({backgroundColor: 'rgb('+byte(content.red)+','+byte(content.green)+','+byte(content.blue)+')'});

	if (content.backgroundImage) { // image instead of text
	    if (backgroundText) {
		backgroundText.remove();
		backgroundText = null;
	    }
	    if (!backgroundImage) {
		backgroundImage = $(new Image());
		backgroundImage.addClass('backgroundImage');
		thing.div().append(backgroundImage);
	    }
	    if (backgroundImage.attr('src')!==content.backgroundImage)
		backgroundImage.attr('src', content.backgroundImage);
	}
	else { // show text
	    if (backgroundImage) {
		backgroundImage.remove();
		backgroundImage = null;
	    }
	    if (!backgroundText) {
		backgroundText = $('<div class="backgroundText"/>');
		backgroundText.css({fontSize: "100%"});
		thing.div().append(backgroundText);
	    }
	    if (backgroundText.text()!==content.text) {
		backgroundText.text(content.text);
		// allow things to settle:
		setTimeout(function() {
		    var xRatio = thing.div().width() / backgroundText.width();
		    var yRatio = thing.div().height() / backgroundText.height();
		    var ratio = Math.min(xRatio, yRatio);
		    var oldFontSize = fraction( backgroundText.css('fontSize') );
		    backgroundText.css({
			fontSize: percent( ratio * oldFontSize ),
			top: percent( (1 - ratio / yRatio) / 2)
		    });
		}, 0);
	    }
	}

	if (content.checked) {
	    if (!backgroundCheck) {
		backgroundCheck = $('<img class="backgroundCheck" src="checkmark.svg"/>');
		thing.div().append(backgroundCheck);
	    }
	}
	else {
	    if (backgroundCheck) {
		backgroundCheck.remove();
		backgroundCheck = null;
	    }
	}
    };


    var editor;
    function setupEditor() {
	editor = $('<div class="editor"/>');
	editor.hide();

	var text = $('<textarea class="text"/>');
	text.val(content.text);
	// textarea needs click events (so don't preventDefault),
	// but do want to stopPropagation:
	text.bind('touchstart', stopPropagation);
	text.bind('mousedown', stopPropagation);

	var thumbnails = $('<div class="thumbnails"/>');

	var typeTimer = null;

	text.keypress(function(event) {
	    if (typeTimer)
		clearTimeout(typeTimer);
	    typeTimer = setTimeout(function() {
		typeTimer = null;

		content.text = text.val();
		thing.save();
		thing.updateContent();

		$.ajax({
		    url: 'http://search.yahooapis.com/ImageSearchService/V1/imageSearch',
		    dataType: 'jsonp',
		    data: {appid: 'YahooDemo', results: 3, output: 'json', query: content.text},
		    success: function(data) {
			thumbnails.empty();
			$.each(data.ResultSet.Result, function(i) {
			    var result = data.ResultSet.Result[i].Thumbnail;
			    var src = result.Url;
			    var width = thing.parent().x(parseFloat(result.Width)) - thing.parent().x(0);
			    var height = thing.parent().y(parseFloat(result.Height)) - thing.parent().y(0);
			    var thumbnail = $(new Image());
			    thumbnail.addClass('thumbnail');
			    thumbnail.attr('src', src);
			    simpleClick(thumbnail, function(event) {
				thing.geometry().height = thing.geometry().width * height/width;
				thing.geometry().fixed = true;
				thing.moved();

				content.backgroundImage = src;
				thing.save();
				thing.updateContent();

				thing.save();

				event.stopPropagation();
				event.preventDefault();
			    });
			    thumbnails.append(thumbnail);
			});
		    }
		});
	    }, TYPE_TIMEOUT);
	});

	var checkButton = $('<div class="checkButton"/>');
	simpleClick(checkButton, function() {
	    content.checked = !content.checked;
	    thing.save();
	    thing.updateContent();
	});

	var deleteButton = $('<div class="deleteButton"/>');
	simpleClick(deleteButton, function() {
	    thing.remove();
	});

	editor.append(text);
	editor.append(checkButton);
	editor.append(deleteButton);
	editor.append(thumbnails);
	thing.div().append(editor);
    }


    var editorVisible = false;
    thing.editorVisible = function() {
	return editorVisible;
    };

    thing.showEditor = function() {
	if (!editorVisible) {
	    if (!editor) setupEditor();

	    editor.slideDown('fast');
	    editorVisible = true;
	}
    };

    thing.hideEditor = function() {
	if (editorVisible) {
	    editor.slideUp('fast');
	    editorVisible = false;
	}
    };

    thing.updateContent();

    return thing;
}
