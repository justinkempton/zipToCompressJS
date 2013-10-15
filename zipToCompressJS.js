PAGE.add$("Constructors.ZipToCompressJS", function($inputBtn, $compressBtn, $result, $minCode, options) {
	dog = {
		UglifyJS : UglifyJS /* requires this library */
		, files : undefined
		, fileArray : []
		, zip     : undefined
		, $result : $result || $("#result")
		, $inputBtn : $inputBtn || $("#files")
		, $compressBtn : $compressBtn || $("#compress")
		, $minCode : $minCode || $("#minCode")
	}

	function pullFromZip(evt) {
		// remove content
		dog.$result.html("")

		dog.files = evt.target.files
		dog.fileArray.length = 0
		for (var i = 0, f; f = dog.files[i]; i++) {

			if (f.type !== "application/zip") {
				dog.$result.append("<div class='warning'>" + f.name + " isn't a 'application/zip', opening it as a zip file may not work :-)</div>")
			}
			var reader = new FileReader()

			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
					var $title = $("<h3>", {
						text : theFile.name
					})
					dog.$result.append($title)
					var $ul = $("<ul>")
					try {

						var dateBefore = new Date()
						// read the content of the file with JSZip
						var zip = dog.zip = new JSZip(e.target.result)
						var dateAfter = new Date()

						$title.append($("<span>", {
							text:" (parsed in " + (dateAfter - dateBefore) + "ms)"
						}))

						// that, or a good ol' for(var entryName in zip.files)
						$.each(zip.files, function (index, zipEntry) {
							dog.fileArray.push(zipEntry)
							$ul.append("<li>" + zipEntry.name + "</li>")
							// the content is here : zipEntry.asText()
						})
						// end of the magic !

					} catch(e) {
						$ul.append("<li class='error'>Error reading " + theFile.name + " : " + e.message + "</li>")
					}
					dog.$result.append($ul)
				}
			})(f)

			// read the file !
			// readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
			reader.readAsArrayBuffer(f)
			// reader.readAsBinaryString(f)
		}
	}

	dog.toSingleText = function() {
		var files = dog.fileArray
			, allText = ""
		for (var x = 0, file = files[x]; x < files.length; x++) {
			allText += file.asText()
			allText += "\n"
		}
		return allText
	}

	dog.toCompressedText = function() {
		var stream = UglifyJS.OutputStream()
			, allText = dog.toSingleText()
			, ast = UglifyJS.parse(allText)

		ast.print(stream)
		return stream.toString()
	}

	function init() {
    if (!window.FileReader || !window.ArrayBuffer) {
      alert("You will need a recent browser to use this demo :(")
      return
    }

    dog.$inputBtn.on("change", pullFromZip)

		dog.$compressBtn.on("click", function() {
			var compressedJS = dog.toCompressedText()
			dog.$minCode.val(compressedJS)
		})
  }

	init()

	return dog
})

