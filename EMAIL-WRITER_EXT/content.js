console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'AI Reply');
    return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.gmail_quote',
        '[role="presentation"]',
    ];
    
    // Fixed: Use 'of' instead of 'in' for array iteration
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    // Fixed: Return empty string outside the loop
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC', // Fixed: Corrected from '.btc' to '.btC' (capital C)
        '.aDh',
        '[role="toolbar"]', // Fixed: Added brackets for attribute selector
        '.gU.Up'
    ];
    
    // Fixed: Use 'of' instead of 'in' for array iteration
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    // Fixed: Return null outside the loop
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }
    
    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');
    
    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const generatedReply = await response.text();
            
            // Try multiple selectors for the compose box
            const composeSelectors = [
                '[role="textbox"][g_editable="true"]',
                '.Am.Al.editable',
                '[contenteditable="true"][role="textbox"]',
                '.editable[contenteditable="true"]'
            ];
            
            let composeBox = null;
            for (const selector of composeSelectors) {
                composeBox = document.querySelector(selector);
                if (composeBox) break;
            }
            
            if (composeBox) {
                // Clear any existing focus first
                document.activeElement?.blur();
                
                // Small delay to ensure blur completes
                setTimeout(() => {
                    composeBox.focus();
                    
                    // Alternative methods to insert text
                    if (document.execCommand('insertText', false, generatedReply)) {
                        console.log('Text inserted using execCommand');
                    } else {
                        // Fallback: Set innerHTML or textContent
                        const selection = window.getSelection();
                        const range = document.createRange();
                        
                        // Clear existing content and insert new text
                        composeBox.innerHTML = generatedReply;
                        
                        // Set cursor to end
                        range.selectNodeContents(composeBox);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        
                        console.log('Text inserted using fallback method');
                    }
                    
                    // Trigger input event to notify Gmail of content change
                    composeBox.dispatchEvent(new Event('input', { bubbles: true }));
                    composeBox.dispatchEvent(new Event('change', { bubbles: true }));
                }, 100);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false; // Fixed: Corrected from 'disable' to 'disabled'
        }
    });
    
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);

        const hasComposeElements = addedNodes.some((node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (
                node.matches('.aDh, .btC[role="dialog"]') ||
                node.querySelector('.aDh, .btC[role="dialog"]')
            )
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

// Start observing DOM changes
observer.observe(document.body, { childList: true, subtree: true });