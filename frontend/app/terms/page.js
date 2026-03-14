'use client';

import LegalLayout from '../../components/LegalLayout';

export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions">
      {(email) => (
        <div className="space-y-5">
          <p className="text-xs text-gray-400">Last updated: March 2026</p>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">1. Acceptance of Terms</h2>
            <p>
              By accessing our website or joining our WhatsApp community group, you agree to be
              bound by these Terms &amp; Conditions. If you do not agree, please do not use our
              platform. We reserve the right to update these terms at any time; continued use of
              the platform constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">2. Service Description</h2>
            <p>
              We operate a free, community-based sports engagement platform via WhatsApp. Our
              community covers a wide range of sports and games including cricket, football, kabaddi,
              basketball, tennis, chess, and more. Members receive live sports updates, match
              coverage, game discussions, and community content — all completely free.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">3. Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least <strong>18 years of age</strong> to join.</li>
              <li>You must have a valid WhatsApp account.</li>
              <li>You must reside in a jurisdiction where participation in such communities is legal.</li>
              <li>You must agree to engage respectfully within the community.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">4. Community Membership</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Joining is entirely free</strong> and will always remain free. No purchase necessary.</li>
              <li>By joining our WhatsApp group, you agree to WhatsApp's{' '}
                <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.</li>
              <li>You will receive sports updates, match highlights, and community content via the group.</li>
              <li>You may leave the group at any time without any obligation or penalty.</li>
              <li>We reserve the right to remove members who violate our community guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">5. Community Standards</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>This is <strong>NOT</strong> a gambling, betting, lottery, or fantasy gaming platform. No financial competition of any kind is conducted.</li>
              <li>No purchase, payment, or financial commitment is required at any time.</li>
              <li>Members are expected to engage respectfully and constructively within the community.</li>
              <li>Content shared in the group must relate to sports, games, and community discussions.</li>
              <li>We reserve the right to update community guidelines at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">6. Prohibited Conduct</h2>
            <p>By using our platform, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create multiple accounts or referral links for fraudulent purposes.</li>
              <li>Spam, harass, or abuse other community members.</li>
              <li>Share misleading information about our platform or community.</li>
              <li>Use automated tools to interact with our website or WhatsApp group.</li>
              <li>Violate any applicable laws or regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">7. Meta &amp; WhatsApp Platform Compliance</h2>
            <p>
              Our advertising and promotional activities comply with{' '}
              <strong>Meta's Advertising Standards</strong>,{' '}
              <strong>Meta Platform Terms</strong>, and{' '}
              <strong>WhatsApp Business Policy</strong>. We do not engage in deceptive, misleading,
              or prohibited advertising practices. All claims made in our promotions are truthful
              and substantiated.
            </p>
            <p className="mt-2">
              Our community operates within the guidelines of WhatsApp's acceptable use policy.
              We do not send bulk unsolicited messages; all members join our community voluntarily.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">8. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and design, is owned by
              or licensed to us and is protected by applicable intellectual property laws. You may
              not reproduce, distribute, or use our content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of our platform,
              your participation in the community, or your reliance on any information provided.
              Our total liability in any matter shall not exceed ₹1,000.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">10. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by and construed in accordance with the
              laws of India. Any disputes shall be subject to the exclusive jurisdiction of the
              courts located in India.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">11. Contact Us</h2>
            <p>
              For questions about these Terms &amp; Conditions, please contact us at:{' '}
              <a href={`mailto:${email}`} className="text-blue-500 underline">{email}</a>
            </p>
          </section>
        </div>
      )}
    </LegalLayout>
  );
}
