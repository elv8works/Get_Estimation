// =================================================================
// ==== CONFIGURATION & API KEYS ====
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

// NOTE: The API key is an empty string. It will be automatically provided by the environment.
const GEMINI_API_KEY = ""; 
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;


// =================================================================
// =================== DO NOT EDIT BELOW THIS LINE ===================
// =================================================================

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const currentPage = window.location.pathname.split("/").pop();

if (currentPage === 'login.html' || currentPage === 'index.html' || currentPage === '') {
    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('employee-name');
    const errorMessage = document.getElementById('error-message');
    const character = document.getElementById('character-svg');
    const showPasswordToggle = document.getElementById('show-password-toggle');

    emailInput.addEventListener('focus', () => character.classList.remove('password-mode', 'peeking'));
    nameInput.addEventListener('focus', () => character.classList.remove('password-mode', 'peeking'));
    passwordInput.addEventListener('focus', () => { character.classList.add('password-mode'); character.classList.remove('peeking'); });
    passwordInput.addEventListener('blur', () => { if (passwordInput.type !== 'text') character.classList.remove('password-mode'); });
    showPasswordToggle.addEventListener('click', () => {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        character.classList.toggle('peeking', passwordInput.type === 'text');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value, password = passwordInput.value, name = nameInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => handleSuccessfulLogin(name))
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    auth.createUserWithEmailAndPassword(email, password)
                        .then(() => handleSuccessfulLogin(name))
                        .catch(err => { errorMessage.textContent = err.message; errorMessage.style.display = 'block'; });
                } else { errorMessage.textContent = error.message; errorMessage.style.display = 'block'; }
            });
    });

    function handleSuccessfulLogin(name) {
        sessionStorage.setItem('employeeUser', JSON.stringify({ name, email: auth.currentUser.email, loginTime: new Date().getTime() }));
        window.location.href = 'estimation.html';
    }

} else if (currentPage === 'estimation.html') {
    // --- ESTIMATION PAGE LOGIC ---
    
    const userJSON = sessionStorage.getItem('employeeUser');
    if (!userJSON || (new Date().getTime() - JSON.parse(userJSON).loginTime > 24 * 60 * 60 * 1000)) {
        sessionStorage.removeItem('employeeUser');
        localStorage.removeItem('lastEntry');
        if(userJSON) alert('Your session has expired. Please log in again.');
        window.location.href = 'login.html';
    }

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
        geminiBtn: document.getElementById('gemini-btn'),
        geminiNotes: document.getElementById('gemini-notes'),
        ornament: document.getElementById('ornament'),
        customerName: document.getElementById('customerName')
    };
    
    window.addEventListener('DOMContentLoaded', () => {
        document.getElementById('employee-name-display').textContent = JSON.parse(userJSON).name;
        resetForm();
    });
    
    const calcTotal = () => { /* ... existing calculation logic ... */ };
    ["quantity", "rate", "makingCharges", "stoneCharges"].forEach(id => document.getElementById(id).addEventListener("input", calcTotal));
    document.querySelectorAll('input[name="mcType"]').forEach(r => r.addEventListener("change", calcTotal));

    // --- GEMINI API LOGIC ---
    elements.geminiBtn.addEventListener('click', async () => {
        const ornamentName = elements.ornament.value;
        const customerName = elements.customerName.value;
        if (!ornamentName) {
            alert("Please enter an ornament name first.");
            return;
        }

        elements.geminiBtn.disabled = true;
        elements.geminiBtn.textContent = "Generating...";
        elements.geminiNotes.value = "Please wait, the AI is crafting a description...";

        const systemPrompt = "You are a professional assistant at 'Keshava Jewellers, Sagara'. Your tone is elegant, warm, and trustworthy. Your task is to generate a brief, appealing description for a jewellery item and a short, personalized thank-you note for the customer. Separate the two parts with '---'.";
        const userQuery = `Generate a description and a thank you note for the following item:\nOrnament: ${ornamentName}\nCustomer Name: ${customerName || 'our valued customer'}`;
        
        try {
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                const [description, note] = text.split('---');
                elements.geminiNotes.value = `${description.trim()}\n\n${note.trim()}`;
            } else {
                throw new Error("No content received from AI.");
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            elements.geminiNotes.value = "Sorry, we couldn't generate a description at this time. Please try again.";
        } finally {
            elements.geminiBtn.disabled = false;
            elements.geminiBtn.innerHTML = "✨ Generate Details";
        }
    });


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        elements.saveBtn.textContent = 'Saving...';
        elements.saveBtn.disabled = true;

        const formData = {
            // ... other form data fields
            geminiNotes: elements.geminiNotes.value, // Add notes to saved data
            // ...
        };

        localStorage.setItem('lastEntry', JSON.stringify(formData));
        
        fetch(GOOGLE_SCRIPT_URL, { /* ... existing fetch logic ... */ });
    });

    elements.printBtn.addEventListener('click', () => { /* ... existing print logic ... */ });
    
    elements.restoreBtn.addEventListener('click', () => {
        const lastEntry = JSON.parse(localStorage.getItem('lastEntry'));
        if (lastEntry) {
            // ... existing restore logic ...
            elements.geminiNotes.value = lastEntry.geminiNotes || ""; // Restore notes
            // ...
        }
    });
  
    function resetForm() {
        form.reset();
        // ... existing reset logic ...
        elements.geminiNotes.value = "";
    }
    
    function populatePrintSlip() {
        // ... existing populate logic ...
        document.getElementById('print-notes').textContent = elements.geminiNotes.value || "Thank you for your visit!";
    }

    // Dummy calcTotal for completeness
    function calcTotal() {
        const q = +elements.quantity.value || 0, r = +elements.rate.value || 0, mc = +elements.makingCharges.value || 0, s = +elements.stoneCharges.value || 0;
        const mcType = document.querySelector('input[name="mcType"]:checked').value;
        let t = 0;
        if (mcType === "grams") t = ((q + mc) * r + s) * 1.03;
        else t = (((q + (q * (mc / 100))) * r) + s) * 1.03;
        elements.totalAmount.value = t.toFixed(2);
    }
}

