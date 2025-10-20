// =================================================================
// ==== PASTE YOUR FIREBASE CONFIG AND APPS SCRIPT URL HERE ====
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCKEMK9IL_aDv1FIGKdzNzCtKYMmSrMxQA",
  authDomain: "mksjewels-estimator.firebaseapp.com",
  projectId: "mksjewels-estimator",
  storageBucket: "mksjewels-estimator.firebasestorage.app",
  messagingSenderId: "686445291013",
  appId: "1:686445291013:web:b8783b0f050f7d1955de6c",
  measurementId: "G-KGTDPSTGLH"
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyC-NIj62N-QdaVysFFzctbUeu29lk-yuvajlgQNrdex95qAfDyHkgKaLsaEcaPwSHHHw/exec';

// =================================================================
// =================== DO NOT EDIT BELOW THIS LINE ===================
// =================================================================

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check which page we are on
const currentPage = window.location.pathname.split("/").pop();

if (currentPage === 'index.html' || currentPage === '') {
    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('employee-name');
    const errorMessage = document.getElementById('error-message');

  // Add this new animation code inside the 'if (currentPage === 'index.html')' block in script.js

// --- ANIMATION LOGIC ---
const character = document.getElementById('character-svg');
const showPasswordToggle = document.getElementById('show-password-toggle');

// Watching email field
emailInput.addEventListener('focus', () => {
    character.classList.remove('password-mode');
    character.classList.remove('peeking');
});
nameInput.addEventListener('focus', () => {
    character.classList.remove('password-mode');
    character.classList.remove('peeking');
});


// Closing eyes for password field
passwordInput.addEventListener('focus', () => {
    character.classList.add('password-mode');
    character.classList.remove('peeking');
});

passwordInput.addEventListener('blur', () => {
    character.classList.remove('password-mode');
});

// Peeking for show/hide password
showPasswordToggle.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Character peeks
        character.classList.add('peeking');
    } else {
        passwordInput.type = 'password';
        // Character stops peeking and closes eyes again
        character.classList.remove('peeking');
    }
});

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        const name = nameInput.value;

        // Try to sign in first
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                handleSuccessfulLogin(name);
            })
            .catch((error) => {
                // If user not found, create a new user (for first-time login)
                if (error.code === 'auth/user-not-found') {
                    auth.createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            handleSuccessfulLogin(name);
                        })
                        .catch(err => {
                            errorMessage.textContent = err.message;
                            errorMessage.style.display = 'block';
                        });
                } else {
                    errorMessage.textContent = error.message;
                    errorMessage.style.display = 'block';
                }
            });
    });

    function handleSuccessfulLogin(name) {
        const user = {
            name: name,
            email: auth.currentUser.email,
            loginTime: new Date().getTime()
        };
        sessionStorage.setItem('employeeUser', JSON.stringify(user));
        window.location.href = 'estimation.html';
    }

} else if (currentPage === 'estimation.html') {
    // --- ESTIMATION PAGE LOGIC ---
    
    // Auth Guard & Auto-Logout
    const userJSON = sessionStorage.getItem('employeeUser');
    if (!userJSON) {
        window.location.href = 'index.html';
    } else {
        const user = JSON.parse(userJSON);
        const loginTime = user.loginTime;
        const oneDay = 24 * 60 * 60 * 1000;
        if (new Date().getTime() - loginTime > oneDay) {
            sessionStorage.removeItem('employeeUser');
            localStorage.removeItem('lastEntry');
            alert('Your session has expired. Please log in again.');
            window.location.href = 'index.html';
        }
    }

    // Get all DOM elements
    const form = document.getElementById('estimation-form');
    const elements = {
        quantity: document.getElementById('quantity'),
        rate: document.getElementById('rate'),
        makingCharges: document.getElementById('makingCharges'),
        stoneCharges: document.getElementById('stoneCharges'),
        totalAmount: document.getElementById('totalAmount'),
        saveBtn: document.getElementById('saveBtn'),
        printBtn: document.getElementById('printBtn'),
        restoreBtn: document.getElementById('restoreBtn'),
    };
    
    // Initial Setup on page load
    window.addEventListener('DOMContentLoaded', () => {
        const user = JSON.parse(userJSON);
        document.getElementById('employee-name-display').textContent = user.name;
        resetForm();
    });
    
    // The calculation logic you provided
    const calcTotal = () => {
        const q = +elements.quantity.value || 0,
            r = +elements.rate.value || 0,
            mc = +elements.makingCharges.value || 0,
            s = +elements.stoneCharges.value || 0;
        const mcType = document.querySelector('input[name="mcType"]:checked').value;
        let t = 0;
        if (mcType === "grams") {
            t = ((q + mc) * r + s) * 1.03;
        } else {
            t = (((q + (q * (mc / 100))) * r) + s) * 1.03;
        }
        elements.totalAmount.value = t.toFixed(2);
    };

    // Add event listeners for calculation
    ["quantity", "rate", "makingCharges", "stoneCharges"].forEach(id => {
        document.getElementById(id).addEventListener("input", calcTotal);
    });
    document.querySelectorAll('input[name="mcType"]').forEach(r => r.addEventListener("change", calcTotal));

    // Handle Form Save
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        elements.saveBtn.textContent = 'Saving...';
        elements.saveBtn.disabled = true;

        const formData = {
            estimationId: document.getElementById('estimation-id').textContent,
            employeeName: document.getElementById('employee-name-display').textContent,
            customerName: document.getElementById('customerName').value,
            mobileNumber: document.getElementById('mobileNumber').value,
            city: document.getElementById('city').value,
            panNumber: document.getElementById('panNumber').value.toUpperCase(),
            ornament: document.getElementById('ornament').value,
            rate: elements.rate.value,
            quantity: elements.quantity.value,
            mcType: document.querySelector('input[name="mcType"]:checked').value,
            makingCharges: elements.makingCharges.value,
            stoneCharges: elements.stoneCharges.value || '0',
            totalAmount: elements.totalAmount.value
        };

        // Save current entry for the "Restore" button
        localStorage.setItem('lastEntry', JSON.stringify(formData));

        // Send data to Google Sheet
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Apps Script
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            elements.saveBtn.style.display = 'none'; // Hide save button
            elements.printBtn.disabled = false; // Enable print button
            alert('Estimation saved successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save estimation. Please check your connection.');
            elements.saveBtn.textContent = 'Save';
            elements.saveBtn.disabled = false;
        });
    });

    // Handle Print Button
    elements.printBtn.addEventListener('click', () => {
        populatePrintSlip();
        window.print();
        // After printing, reset the form and show the restore button
        setTimeout(() => {
            resetForm();
            elements.restoreBtn.style.display = 'inline-block';
        }, 500);
    });
    
    // Handle Restore Button
    elements.restoreBtn.addEventListener('click', () => {
        const lastEntry = JSON.parse(localStorage.getItem('lastEntry'));
        if(lastEntry) {
            document.getElementById('estimation-id').textContent = lastEntry.estimationId;
            document.getElementById('customerName').value = lastEntry.customerName;
            document.getElementById('mobileNumber').value = lastEntry.mobileNumber;
            document.getElementById('city').value = lastEntry.city;
            document.getElementById('panNumber').value = lastEntry.panNumber;
            document.getElementById('ornament').value = lastEntry.ornament;
            elements.rate.value = lastEntry.rate;
            elements.quantity.value = lastEntry.quantity;
            document.querySelector(`input[name="mcType"][value="${lastEntry.mcType}"]`).checked = true;
            elements.makingCharges.value = lastEntry.makingCharges;
            elements.stoneCharges.value = lastEntry.stoneCharges;
            elements.totalAmount.value = lastEntry.totalAmount;
            
            // Re-enable saving for the restored entry (if it needs to be re-saved)
            elements.saveBtn.style.display = 'inline-block';
            elements.saveBtn.textContent = 'Save';
            elements.saveBtn.disabled = false;
            elements.printBtn.disabled = true;
        }
    });

    // Helper function to reset the form for a new entry
    function resetForm() {
        form.reset();
        document.getElementById('estimation-id').textContent = Math.floor(10000 + Math.random() * 90000);
        const now = new Date();
        document.getElementById('date-time').textContent = now.toLocaleString('en-IN');
        elements.totalAmount.value = '0.00';
        elements.saveBtn.style.display = 'inline-block';
        elements.saveBtn.textContent = 'Save';
        elements.saveBtn.disabled = false;
        elements.printBtn.disabled = true;
        elements.restoreBtn.style.display = 'none';
        document.getElementById('customerName').focus();
    }
    
    // Helper function to populate the hidden printable slip
    // Helper function to populate the hidden printable slip
    function populatePrintSlip() {
        const mask = (str) => str ? 'x'.repeat(str.length - 3) + str.slice(-3) : 'N/A';
        
        // This function now matches the IDs in your new professional print slip HTML
        
        // Header Info
        document.getElementById('print-employee').textContent = document.getElementById('employee-name-display').textContent;
        
        // Main Details
        document.getElementById('print-customer').textContent = document.getElementById('customerName').value;
        document.getElementById('print-city').textContent = document.getElementById('city').value || 'N/A'; // Added this new field
        document.getElementById('print-mobile').textContent = mask(document.getElementById('mobileNumber').value);
        document.getElementById('print-ornament').textContent = document.getElementById('ornament').value;
        document.getElementById('print-qty').textContent = elements.quantity.value;
        document.getElementById('print-rate').textContent = elements.rate.value;
        document.getElementById('print-mcvalue').textContent = elements.makingCharges.value;
        document.getElementById('print-stone').textContent = elements.stoneCharges.value || '0';
        
        // Total and ID
        document.getElementById('print-total').textContent = elements.totalAmount.value;
        document.getElementById('print-id').textContent = document.getElementById('estimation-id').textContent;
        
        // These IDs no longer exist in the new HTML, so they have been removed from the script:
        // document.getElementById('print-date').textContent = ...
        // document.getElementById('print-pan').textContent = ...
        // document.getElementById('print-mctype').textContent = ...
    }
}
