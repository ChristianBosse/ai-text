import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
    element.textContent = "";

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += ".";

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === "....") {
            element.textContent = "";
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 10);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

    // to clear the textarea input
    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    //fetch data from server => bot response

    const response = await fetch("http://localhost:5000", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: data.get("prompt"),
        }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";

        alert(err);
    }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});

let textarea = document.getElementById("txtArea");

textarea.addEventListener("keydown", (e) => {
    if (e.keycode === 13) {
        autosize(true);
    } else {
        autosize();
    }
});

function autosize(reset) {
    let el = this;
    el.style.cssText = "overflow: hidden !important";

    if ((reset = true)) {
        el.style.cssText = "height: 20px";
    }

    if (el.scrollHeight > 60) {
        el.style.cssText = "overflow: scroll !important";
        el.style.cssText = "height: 60px";
        console.log("> 60");
    } else if (el.scrollHeight < 60) {
        el.style.cssText = "height: 20px";
        console.log("< 60");
    }
}

let userOptions = document.getElementById("user_profile");
let userOptionsDiv = document.getElementById("user_options");
let resetUserOption = 0;

window.addEventListener("click", function (e) {
    if (userOptions.contains(e.target) && resetUserOption == 1) {
        userOptionsDiv.classList.remove("show");
        userOptionsDiv.classList.add("hide");
        resetUserOption = 0;
        console.log(resetUserOption, "1");
    } else if (userOptions.contains(e.target)) {
        userOptionsDiv.classList.remove("hide");
        userOptionsDiv.classList.add("show");
        resetUserOption = 1;
        console.log(resetUserOption, "2nd");
    } else if (!userOptions.contains(e.target)) {
        userOptionsDiv.classList.remove("show");
        userOptionsDiv.classList.add("hide");
        resetUserOption = 0;
        console.log(resetUserOption, "3rd");
    }
});
