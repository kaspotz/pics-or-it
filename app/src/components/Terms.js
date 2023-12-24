import React from 'react';

const Terms = () => {
    return (
        <div style={{ paddingBottom: '5em' }}>
            <h1>Terms of Service</h1>
            <p>These poidh Terms of Service ({"\"Terms\""}) govern your use of the poidh platform, which connects bounty posters with users that upload photos to claim bounties. By using our platform, you agree to these Terms.</p>
            <h2>Acceptance of Terms</h2>
            <p>By accessing or using the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
            <h2>Eligibility</h2>
            <p>To use our services, you must be at least 18 years old and capable of entering into legally binding contracts.</p>
            <h2>Prohibited Conduct</h2>
            <p>Users may not:</p>
            <div className="terms-list-prohibited">
                <ul>
                    <li>{'\u2022'} Post illegal or unethical bounties</li>
                    <li>{'\u2022'} Use the platform for fraudulent purposes</li>
                    <li>{'\u2022'} Post illegal or unethical claims</li>
                    <li>{'\u2022'} Post illegal or unethical photos</li>
                    <li>{'\u2022'} Harass other users</li>
                </ul>
            </div>
            <h2>Termination</h2>
            <p>We reserve the right to block users, bounties, and claims that violate these Terms.</p>
            <h2>Disclaimers</h2>
            <p>The platform is provided {"\"as is\""}. We make no guarantees regarding the accuracy, completeness, or reliability of any user-posted content.</p>
            <h2>Limitation of Liability</h2>
            <p>Pics or it didn’t happen (poidh) shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of the platform.</p>
            <h2>Updates to These Terms</h2>
            <p>We may modify these Terms at any time. By continuing to use the platform after changes are made, you agree to be bound by the updated Terms.</p>
            <h2>Geographic Limitations</h2>
            <p>Users from Cuba, Iran, North Korea, Syria, and Venezuela are not permitted to utilize poidh for posting or claiming bounties.</p>
            <h2>Contact</h2>
            <p>For any questions about these Terms, contact poidhxyz@gmail.com</p>
            <h2>Governing Law</h2>
            <p>These Terms are governed by the laws of the United States.</p>
        </div>
    );
}

export default Terms;