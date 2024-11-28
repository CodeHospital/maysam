// Initialize EmailJS with your public key
(function() {
    emailjs.init("s8cYSCmPlGYIq4b8a"); // Replace with your actual EmailJS public key
})();

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // Get form data
    const formData = {
        name: this.querySelector('input[name="name"]').value,
        email: this.querySelector('input[name="email"]').value,
        message: this.querySelector('textarea[name="message"]').value
    };

    // Send email using EmailJS
    emailjs.send('service_d1svoix', 'template_p97hkyq', {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_name: 'Maysam Torabi', // Your name
        reply_to: formData.email
    })
    .then(function() {
        // Show success message
        alert('Thank you! Your message has been sent.');

        // Reset form
        document.getElementById('contact-form').reset();
    })
    .catch(function(error) {
        // Show error message
        console.error('Error:', error);
        alert('Oops! Something went wrong. Please try again later.');
    })
    .finally(function() {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
});
