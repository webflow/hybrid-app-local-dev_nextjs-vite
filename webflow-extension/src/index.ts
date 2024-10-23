const emojiMap = {
  smile: "😊",
  wink: "😉",
  heart: "😍",
  cry: "😭",
};

// default to smile
let selectedEmoji = emojiMap.smile;
addButtonListeners();

document.getElementById("extension-form").onsubmit = async (event) => {
  event.preventDefault();
  // Get the current selected Element
  const el = await webflow.getSelectedElement();

  // If styles can be set on the Element
  if (el && el.styles && el.children) {
    //Get current element's style
    const currentStyle = await el.getStyles();

    // Get style
    const emojiStyle = await createOrUseStyle("emoji-style");

    // Create a new element that will display the text-emoji
    const labelElement = await el.append(webflow.elementPresets.DOM);
    await labelElement.setTag("span");
    await labelElement.setStyles([...currentStyle, emojiStyle]);
    await labelElement.setTextContent(selectedEmoji);
  } else {
    alert("Please select a text element");
  }
};

// Check if specified style exists. If not, create a new style
async function createOrUseStyle(styleName) {
  // Check if this style exists to avoid duplicate styles
  const style = await webflow.getStyleByName(styleName);
  if (style) {
    // Return existing style
    return style;
  } else {
    // Create a new style, return it
    const emojiStyle = await webflow.createStyle(styleName);
    await emojiStyle.setProperties({ "background-color": "#FF00FF" });
    return emojiStyle;
  }
}

function handleEmojiClick(emoji) {
  selectedEmoji = emoji;
}

function addButtonListeners() {
  document.getElementById("smile").onclick = () => {
    handleEmojiClick(emojiMap.smile);
  };

  document.getElementById("wink").onclick = () => {
    handleEmojiClick(emojiMap.wink);
  };

  document.getElementById("heart").onclick = () => {
    handleEmojiClick(emojiMap.heart);
  };

  document.getElementById("cry").onclick = () => {
    handleEmojiClick(emojiMap.cry);
  };
}
