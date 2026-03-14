'use client';

import LegalLayout from '../../components/LegalLayout';

export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer">
      {(email) => (
        <div className="space-y-5">
          <p className="text-xs text-gray-400">Last updated: March 2026</p>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">1. General Information</h2>
            <p>
              The information provided on this website is for general community engagement and
              informational purposes only. While we strive to keep content accurate and up to date,
              we make no warranties — express or implied — about the completeness, accuracy, or
              reliability of any information on this site.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">2. Not a Gambling or Betting Platform</h2>
            <p>
              This platform is <strong>NOT</strong> a gambling, betting, lottery, or fantasy sports
              platform. We do not facilitate any form of wagering or skill-based competition for
              financial gain. Joining this community is completely free and no entry fee or
              payment of any kind is required or accepted.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">3. Content Accuracy</h2>
            <p>
              Sports scores, schedules, statistics, and related content shared within our community
              are sourced from publicly available information. We do not guarantee the accuracy,
              completeness, or timeliness of such content. Always verify important information
              through official sports organisations or broadcasters.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">4. Meta &amp; WhatsApp Disclaimer</h2>
            <p>
              This website and community platform are <strong>not endorsed by, affiliated with,
              sponsored by, or officially connected to Meta Platforms, Inc., WhatsApp LLC,</strong> or
              any of their subsidiaries or affiliates. The names "Meta", "Facebook", and "WhatsApp"
              are trademarks of their respective owners and are referenced solely for descriptive
              purposes to explain the platforms used for community communication.
            </p>
            <p className="mt-2">
              Our advertising campaigns and promotional content comply with{' '}
              <strong>Meta's Advertising Policies</strong> and do not contain misleading, deceptive,
              or prohibited content. We do not make unrealistic income claims or guarantee financial
              returns of any kind.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">5. No Affiliation with Sports Organisations</h2>
            <p>
              This platform is not affiliated with, endorsed by, or officially connected to any sports
              league, board, team, or governing body, including but not limited to the BCCI, IPL,
              ISL, PKL, FIFA, or any other sports organisation. Sports names and terminology are
              used for descriptive purposes only to describe the topics discussed in our community.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">6. External Links</h2>
            <p>
              Our website may contain links to external websites (e.g., WhatsApp). We are not
              responsible for the content, privacy practices, or accuracy of any third-party
              websites. Visiting external links is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">7. Limitation of Liability</h2>
            <p>
              We shall not be held liable for any loss, damage, or inconvenience arising from
              reliance on information on this website or from participation in our community group.
              Use of this platform is entirely at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-1">8. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Disclaimer, please contact us
              at:{' '}
              <a href={`mailto:${email}`} className="text-blue-500 underline">{email}</a>
            </p>
          </section>
        </div>
      )}
    </LegalLayout>
  );
}
