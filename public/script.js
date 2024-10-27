// Function to send location to the server
async function sendSOS() {
    const messageInput = document.getElementById('sos-message-input');
    const message = messageInput.value.trim();

    if (!message) {
        alert("Please enter a message before sending SOS.");
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch('/saveSOS', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, latitude, longitude }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.text();
                alert(result); // Notify user of success
            } catch (error) {
                console.error("Error sending SOS:", error);
                alert("There was an error sending your SOS. Please try again.");
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location. Please enable location services.");
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to handle voice recognition input for comments
function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false; // Set to true if you want interim results
    recognition.maxAlternatives = 1; // Limit to one alternative

    recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        document.getElementById('comment-input').value = spokenText; // Fill the textarea with spoken text
        console.log('Recognized text:', spokenText);
    };

    recognition.onerror = (event) => {
        console.error('Error occurred in recognition:', event.error);
        alert('Error occurred in voice recognition: ' + event.error);
    };

    recognition.onend = () => {
        console.log('Voice recognition ended.');
    };

    recognition.start();
}

// Event listeners
// Event listeners
document.getElementById('sos-button').addEventListener('click', function() {
    // Prompt for confirmation
    const confirmation = confirm("Are you sure you want to send an SOS alert?");
    
    if (confirmation) {
        // Simulate sending an SOS alert
        sendSOSAlert();
    } else {
        alert("SOS alert canceled.");
    }
});

function sendSOSAlert() {
    // Simulate sending the SOS alert (e.g., to a server)
    const alertMessage = document.getElementById('alert-message');
    alertMessage.textContent = "SOS alert sent! Help is on the way.";
    alertMessage.style.display = "block";

    // Here you could add code to send the alert to a server or notify emergency contacts
    // For example:
    // fetch('/sendSOS', { method: 'POST', body: JSON.stringify({ message: 'SOS!' }) })
    //     .then(response => response.json())
    //     .then(data => console.log(data))
    //     .catch(error => console.error('Error:', error));
}
document.getElementById('voice-comment-button').addEventListener('click', startVoiceRecognition);

document.getElementById('submit-comment').addEventListener('click', async () => {
    const commentInput = document.getElementById('comment-input');
    const comment = commentInput.value.trim();

    if (!comment) {
        alert("Please enter a comment before submitting.");
        return;
    }

    try {
        const response = await fetch('/saveComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.text();
        alert(result);
        commentInput.value = ''; // Clear the input after submission

        // Optionally, display the comment in the comments list
        const commentsList = document.getElementById('comments-list');
        const newComment = document.createElement('div');
        newComment.textContent = comment;
        commentsList.appendChild(newComment);
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert("There was an error submitting your comment. Please try again.");
    }
});