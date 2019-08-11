var links = document.querySelectorAll(".rg_meta")
var regex = /\.(jpe?g|png|tif?f|bmp)/i
var urls = []
links.forEach(function(node) {
  urls.push(JSON.parse(node.innerText).ou)
})
var filtered = urls.filter(function(e) {
  return regex.exec(e) !== null
})

function saveImage(url) {
  var $a = document.createElement("a")
  $a.download = "AD"
  $a.href = url
  $a.src = url
  document.body.appendChild($a)
  $a.click()
  document.body.removeChild($a)

}

var saveInterval = setInterval(function () {
  var url = filtered.shift()
  saveImage(url)
  if(filtered.length === 0) {
    clearInterval(saveInterval)
    console.log("done!")
  }
}, Math.random()*1000 + 150);