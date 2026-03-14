'use client';

import LegalLayout from '../../components/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      {(email) => (
        <div className="space-y-5">
          <p className="text-xs text-gray-400">Last updated: March 2026</p>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">1. Introduction</h2>
            <p>
              Welcome to our Sports Fan Community platform. We are committed to protecting your
              personal information and your right to privacy. This Privacy Policy explains how we
              collect, use, and safeguard information when you visit our website or join our WhatsApp
              community group.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact information</strong> — your name and WhatsApp phone number when you join our community group.</li>
              <li><strong>Usage data</strong> — pages visited, referral codes used, and interaction timestamps on our website.</li>
              <li><strong>Device data</strong> — browser type, operating system, and anonymised IP address for analytics purposes.</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> collect payment information. Joining is always free.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate and manage the WhatsApp community group.</li>
              <li>To send sports updates, match coverage, and community content to group members.</li>
              <li>To analyse website traffic and improve user experience.</li>
              <li>To respond to your enquiries sent to our contact email.</li>
              <li>To comply with applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">4. Meta &amp; WhatsApp Compliance</h2>
            <p>
              Our website may use <strong>Meta Pixel</strong> (Facebook Pixel) for advertising
              analytics. This tool collects anonymised data about page visits and actions to help us
              measure the effectiveness of our promotions. No personally identifiable information is
              shared with Meta without your consent.
            </p>
            <p className="mt-2">
              Our WhatsApp community is operated in compliance with{' '}
              <strong>WhatsApp's Terms of Service</strong> and{' '}
              <strong>WhatsApp Business Policy</strong>. Messages sent within the group are subject
              to WhatsApp's own Privacy Policy. We do not use WhatsApp Business API to send unsolicited
              messages; members join voluntarily and may leave at any time.
            </p>
            <p className="mt-2">
              We comply with <strong>Meta Platform Terms</strong> and do not engage in any activity
              that violates Meta's advertising or community standards.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">5. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              data with trusted service providers (e.g., hosting, analytics) under strict
              confidentiality agreements. We may disclose information if required by law or to
              protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">6. Data Retention</h2>
            <p>
              We retain your information for as long as your membership is active, or for up to
              12 months after you leave our community group, whichever is earlier. You may request
              deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Withdraw consent by leaving the WhatsApp group at any time.</li>
              <li>Lodge a complaint with a relevant data protection authority.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">8. Cookies</h2>
            <p>
              Our website uses essential cookies to ensure basic functionality (e.g., remembering
              popup preferences within your session). No tracking or third-party advertising cookies
              are placed without your consent.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">9. Children's Privacy</h2>
            <p>
              Our platform is intended for users aged 18 and above. We do not knowingly collect
              personal information from minors. If you believe a minor has provided us with personal
              information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">10. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page
              with an updated date. Continued use of our platform after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">11. Contact Us</h2>
            <p>
              For any privacy-related questions, data requests, or concerns, please contact us at:{' '}
              <a href={`mailto:${email}`} className="text-blue-500 underline">{email}</a>
            </p>
          </section>
        </div>
      )}
    </LegalLayout>
  );
}
