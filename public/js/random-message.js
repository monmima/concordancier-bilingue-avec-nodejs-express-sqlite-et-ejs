console.log("This is a random message! Hope you like it!");
console.log("This message demonstrates that JavaScript was served by the server!");

/**
 * if you try to inject the <strong> tags in the back-end,
 * you actually get something like &lt;strong&gt;
 * in the front-end (escaped characters)
 */
function turnPlaceholdersToStrongTags() {
    let text = document.querySelector("body").innerHTML;

    text = text.replace(/zzzz-openstrongtag-zzzz/g, "<strong>");
    text = text.replace(/zzzz-closestrongtag-zzzz/g, "</strong>");
    
    // console.log(text);
    
    return document.querySelector("body").innerHTML = text;
}

turnPlaceholdersToStrongTags();