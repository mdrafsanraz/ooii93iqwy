import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Use | RDistro',
  description:
    'Terms of Use for the RDistro music distribution platform operated by Rdistro Ltd. Read the conditions that govern access to rdistro.net and related services.',
}

const sections = [
  { id: 'acceptance', label: 'Acceptance of the Terms of Use' },
  { id: 'changes', label: 'Changes to the Terms of Use' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'access', label: 'Accessing the Platform and Security' },
  { id: 'conduct', label: 'What You Can Do and What You Cannot Do' },
  { id: 'fees', label: 'Fees' },
  { id: 'duration', label: 'Duration and Termination' },
  { id: 'ip', label: 'Intellectual Property Rights' },
  { id: 'fraud', label: 'Fraud' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'warranty', label: 'Warranty, Limitation of Liability' },
  { id: 'priority', label: 'Priority Accounts' },
  { id: 'miscellaneous', label: 'Miscellaneous' },
]

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-bold text-black mt-12 mb-5 pb-3 border-b border-gray-200">
        {title}
      </h2>
      <div className="space-y-4 text-gray-700 leading-relaxed text-[15px]">{children}</div>
    </section>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-black pt-4">{children}</h3>
}

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="pt-24 min-h-screen bg-gray-50">
        <section className="py-12 md:py-16 px-4 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Terms of Use</h1>
            <p className="text-lg text-gray-600">
              Thank you for choosing Rdistro Ltd as your Digital Music Distributor!
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10 text-gray-700 leading-relaxed text-[15px]">
            <p>
              These terms of use are entered into by and between you (“End User”, “You”, “Your”)
              and Rdistro Ltd, a private limited company incorporated in England and Wales,
              organized and existing under the laws of the United Kingdom (“Company”, “We”, or
              “Us”), with its principal place of business located in 128 City Road, London, United
              Kingdom, EC1V 2NX. The following terms and conditions, together with any documents
              they expressly incorporate by reference (collectively, “Terms of Use”), govern Your
              access to and use of the platform available at{' '}
              <a
                href="https://rdistro.net"
                className="text-black font-medium underline underline-offset-2 hover:text-gray-700"
              >
                https://rdistro.net
              </a>
              , including any content, functionality, and services offered on or through the website
              (the “Platform”), whether as a guest or a registered user.
            </p>

            <nav className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-sm font-semibold text-black mb-3">Contents</p>
              <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {sections.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-gray-600 hover:text-black transition-colors"
                    >
                      {index + 1}. {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <Section id="acceptance" title="Acceptance of the Terms of Use">
              <p>
                Please read the Terms of Use carefully before using the Platform. By using the
                Platform or by clicking to accept or agree to the Terms of Use when this option is
                made available to You, You accept and agree to be bound and abide by these Terms of
                Use, including our Privacy Policy, Cookie Policy, Anti-Fraud Policy, GDPR a
                Regulations, and any other document that We may post on the Platform from time to
                time. If You do not want to agree to these Terms of Use, You must not access or use
                the Platform.
              </p>
              <p>
                This Platform is intended for individuals of legal age or with parental consent. If
                You are under the age of thirteen (13) years, You may not create an account and You
                must immediately exit the Platform. By using or registering with this Platform, You
                represent that You are of legal age to form a binding contract or have Your
                parent’s consent to do so (the parent will be the contracting party for minors 13
                up to the age of majority). We continuously use our best efforts to avoid violating
                any applicable laws and regulations regarding minors, including compliance with the
                Children’s Online Privacy Protection Act (COPPA) and other similar laws.
              </p>
            </Section>

            <Section id="changes" title="Changes to the Terms of Use">
              <p>
                We may revise and update these Terms of Use from time to time at our sole
                discretion. All changes are effective immediately when We post them and apply to
                all access to and use of the Platform thereafter. Your continued use of the
                Platform following the posting of revised Terms of Use means that You accept and
                agree to the changes. You are expected to check this page regularly to be aware of
                any changes, as they are binding on You.
              </p>
            </Section>

            <Section id="definitions" title="Definitions">
              <p>
                To facilitate the understanding of these Terms of Use, the following principal
                expressions will have these meanings:
              </p>
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold text-black">“Customer”</dt>
                  <dd>
                    refers to any individual that accesses or makes use of a Digital Music Service.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“Cover Song Licensing”</dt>
                  <dd>refers to cover song clearance services provided by Us.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“Digital Distribution”</dt>
                  <dd>
                    means the transferring by any means of data transmission or communication,
                    through the internet, internet radio, kiosks, in-store listening posts, mobile,
                    wireless, satellite and similar communication systems, whether now known or
                    existing in the future, of the End User Content in multiple digital formats
                    including but not limited to clips, permanent downloads, subscriptions, streams
                    and timeout-downloads, ring-tones and ring-back tones and any other means.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“Digital Music Service”</dt>
                  <dd>
                    means any digital outlet, such as music download portals, music and video
                    streaming services, mobile music platforms, digital (and terrestrial) radio
                    stations, digital (and terrestrial) television networks, and mobile networks
                    (i.e., Apple Music, iTunes, Spotify, Tidal, Amazon, etc.), that enables
                    Customers to purchase and/or listen to End User Content.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“End User”</dt>
                  <dd>
                    means You (hereinafter, the End User), which is an artist, songwriter, author,
                    producer, agent (including royalty recipients), rights holder, or others who
                    are authorized and entitled to exploit certain music (including the composition
                    and the recording) and to use the Platform, the Platform API or portions
                    thereof.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“End User Content”</dt>
                  <dd>
                    means all intellectual property works (including without limitation musical
                    works, recordings, video clips, ring-tones, real-tones, lyrics, logos, covers,
                    and photos) as to which the End User has the necessary exploitation rights,
                    including customary “Neighboring Rights”.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-black">“Service”</dt>
                  <dd>
                    means the service provided by Us through the Platform, in order to make the End
                    User Content available on Digital Music Services (here, the Digital
                    Distribution Services).
                  </dd>
                </div>
              </dl>
              <p>Hence, these are the rights and obligations of each of Us:</p>
            </Section>

            <Section id="access" title="Accessing the Platform and Security">
              <Sub>2.1</Sub>
              <p>
                During the Duration and subject to Your compliance with these Terms of Use, You
                have the right to access the Platform and utilize the Service provided by Us
                through it.
              </p>

              <Sub>2.2</Sub>
              <p>
                For information purposes, the features of the Platform include but are not limited
                to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  (a) Uploading the End User Content to the Platform for its availability on
                  Digital Music Services,
                </li>
                <li>
                  (b) Selecting the channels, territories, and Digital Music Services where End
                  Users want their content to be available,
                </li>
                <li>
                  (c) Rendering optional services, including quality control, distribution,
                  updates, and storage,
                </li>
                <li>(d) Paying the corresponding fees for the contracting services directly,</li>
                <li>
                  (e) Hosting the End User Content, qualifying, transforming, and transmitting it
                  to the Digital Music Services,
                </li>
                <li>(f) Updating the distributed works in Digital Music Services,</li>
                <li>(g) Taking down content,</li>
                <li>(h) Assigning codes (ISRC, UPC, ISWC),</li>
                <li>
                  (i) Accessing sales and usage reports of the End User Content in the Digital
                  Music Services,
                </li>
                <li>(j) Requesting payment of the Royalties generated by the End User Content, and</li>
                <li>(k) Managing and receiving Neighboring Rights.</li>
              </ul>
              <p>
                We reserve the right to withdraw or amend the Platform, and any service or material
                We provide on the Platform, including, without limitation, changing the
                characteristics, design, appearance, or presentation of the Platform, in our sole
                discretion without notice. We will not be liable if, for any reason, all or any
                part of the Platform is unavailable at any time or for any period. From time to
                time, We may restrict access to some parts of the Platform, or the entire Platform,
                to users, including registered users. If You are unsatisfied with the resulting
                Platform, You can terminate the relationship in the terms described in these Terms
                of Use.
              </p>

              <Sub>2.3</Sub>
              <p>
                Furthermore, You undertake that You have all necessary rights with respect to End
                User Content to exploit it through the Platform and, therefore, grant Us a
                worldwide right to reproduce, store, transfer, and make available End User Content
                as requested by You at each time, in the terms described in Section 6. This right
                and authorization are granted on an exclusive basis for those Digital Music
                Services on which You decide to make End User Content available through our
                Service; this means that if You use the Service to make End User Content available
                in a specific Digital Music Service, You cannot make the same content available in
                the same Digital Music Service using a service different than the Service and the
                Platform.
              </p>

              <Sub>2.4</Sub>
              <p>
                To access the Platform or some of its resources, You may be asked to provide
                certain registration details or other information. It is a condition of Your use of
                the Platform that all the information You provide on the Platform is correct,
                current, and complete. You agree that all information You provide to register with
                this Platform or otherwise, including, but not limited to, using any interactive
                features on the Platform, is governed by our Privacy Policy, and You consent to all
                actions We take with respect to Your information consistent with our Privacy
                Policy. If You choose or are provided with, a username, password, or any other
                piece of information as part of our security procedures, You must treat such
                information as confidential, and You must not disclose it to any other person or
                entity. You also acknowledge that Your account is personal to You and agree not to
                provide any other person with access to the Platform or portions of it using Your
                username, password, or other security information. You agree to notify Us
                immediately of any unauthorized access to or use of Your username or password or
                any other security breach. You also agree to ensure that You exit Your account at
                the end of each session. You should use caution when accessing Your account from a
                public or shared computer so that others are not able to view or record Your
                password or other personal information. We have the right to disable any username,
                password, or other identifiers, whether chosen by You or provided by Us, at any
                time in our sole discretion for any or no reason, including if, in our opinion, You
                have violated any provision of these Terms of Use.
              </p>
            </Section>

            <Section id="conduct" title="What You Can Do and What You Cannot Do">
              <Sub>3.1</Sub>
              <p>
                By registering and uploading End User Content on the Platform, You assume and
                undertake the following obligations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You shall use the Platform diligently and upload information and content whose
                  rights belong to You or for which You are authorized by the rights holder.
                </li>
                <li>
                  You shall provide all the necessary information to use the Service, which We will
                  request during the use of the Service.
                </li>
                <li>
                  You shall pay all the applicable fees for the Services rendered by Us, as
                  described below.
                </li>
                <li>
                  You shall inform Us of any activity that is inconsistent with the Terms of Use.
                </li>
                <li>
                  You shall indicate through the Platform if End User Content contains “explicit”
                  content. The term “explicit” content refers to content that evokes sexual,
                  racist, violent, or any other harmful connotations.
                </li>
                <li>
                  You shall not perform illegal activities through the Platform or the Services,
                  and/or actions that could harm or damage any party, including Us.
                </li>
              </ul>

              <Sub>3.2</Sub>
              <p>
                You undertake to use diligently the Platform and, therefore, undertake:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  (a) not to grant access to the Platform to any third party or employees that does
                  not have his/her/their own credentials to access the Platform,
                </li>
                <li>(b) not to access the source code of the Platform,</li>
                <li>
                  (c) not to use the information, rules or instructions contained in the Platform
                  for purposes different than those established in these Terms of Use,
                </li>
                <li>
                  (d) not to disclose to any third party any of the information obtained through
                  the Platform,
                </li>
                <li>
                  (e) not to permit the public to access or use the Platform (including without
                  limitation, via the internet),
                </li>
                <li>
                  (f) not to use the Platform to upload content not owned by You or for which You
                  do not have an explicit license to exploit commercially,
                </li>
                <li>(g) not to reproduce the Platform, in whole or in part, for any purposes;</li>
                <li>
                  (h) not to copy and/or distribute the Platform, in whole or in part, by any
                  manner,
                </li>
                <li>
                  (i) not to create any form of “frame” or “mirror” for (any part of) the Platform
                  on any other server or wireless or Internet‑based device,
                </li>
                <li>(j) not to transfer the Platform to any third party,</li>
                <li>
                  (k) not to assign, sell, resell, rent, lease, lend, sublicense, outsource or
                  otherwise transfer the Platform and/or the Service to any third party, or
                  authorize or appoint any third party to do so,
                </li>
                <li>
                  (l) and not to modify the Platform or provide any person with the means to do the
                  same. This includes the obligation not to create derivative works and/or to
                  translate, disassemble, recompile, alter, destroy, or reverse engineer the
                  Platform or attempt to do so, unless when expressly permitted by the applicable
                  regulation; and not to circumvent the technological protection measures
                  incorporated in the Platform.
                </li>
              </ul>

              <Sub>3.3</Sub>
              <p>
                Quicklink and Shortlink features should be used solely for promotion and
                redirection of End User’s music services and music catalog. Using the Quicklink or
                Shortlink to promote or redirect to other sites, including affiliate links,
                viruses, harmful/insensitive content, hateful/racist content, pornographic content,
                and/or other non-media related links, will be considered spam and may result in an
                immediate and permanent ban from this service.
              </p>

              <Sub>3.4</Sub>
              <p>
                In general, You agree to use the Platform in a lawful and diligent manner and will
                not do anything forbidden by Law of by these Terms of Use. You will be liable to Us
                in respect of any breach of these Terms of Use, as described in Section 9.
              </p>

              <Sub>3.5</Sub>
              <p>
                Selected users have been granted access to a certain “portal” with synchronization
                and publishing administration features on the Platform. The registrations submitted
                there would be registered to the mechanical collection societies (HFA, MLC, etc.)
                and performance rights organizations under an agreement these organizations have
                made with Us. This &quot;portal&quot; on the Platform should be considered as
                “Exhibit A” as mentioned in the Agreement. This Section 3.5 only applies to certain
                selected users who have either applied or were recruited by Us and have opted into
                publishing administration contractually.
              </p>

              <Sub>3.6</Sub>
              <p>
                After registration, You can upload End User Content (including sound recordings and
                audiovisual works, photographs, images, and other related content) to Your personal
                account for their subsequent Digital Distribution.
              </p>

              <Sub>3.7</Sub>
              <p>
                You can only upload content to the Platform for which You are the owner or have the
                rights holders’ permission in writing. You cannot lawfully upload any content whose
                rights are held by third parties. We may ask You to provide Us with all documents,
                contracts, and registration certificates necessary to confirm that You own the
                rights to End User Content and reserve the right to ask You not to upload content
                from a specific author or producer. At our own discretion, We may also remove any
                of End User Content from the Platform that We don’t believe belongs to You.
              </p>

              <Sub>3.8</Sub>
              <p>
                As specified before, You cannot, under any circumstance, upload any content that
                could be harmful, threatening, unlawful, confidential, defamatory, libelous,
                harassing, obscene, indecent, fraudulent, infringing the rights of privacy, incites
                hate or includes texts of racist, ethnic or other nature, that is against or
                hinders or limits in any way any individual, or which may expose Us or third
                parties to any harm or liability of any kind.
              </p>

              <Sub>3.9</Sub>
              <p>
                You cannot upload any private or fake information of any third party, including
                without reservation physical addresses, phone numbers, and/or email addresses.
              </p>

              <Sub>3.10</Sub>
              <p>
                You are not allowed to upload any content that may breach any domestic or
                international copyright law or any other intellectual property law and/or or
                third-party brand ownership. This includes violations of domestic or international
                trademark law and, without exception, rights of publicity.
              </p>

              <Sub>3.11</Sub>
              <p>
                As We specified elsewhere herein, You are free to exploit End User Content,
                directly or through third parties, to Digital Music Services which are not selected
                or made available on the Platform.
              </p>

              <Sub>3.12</Sub>
              <p>
                We reserve the right to access and analyze all or part of End User Content to
                guarantee compliance with the Law and with these Terms of Use. We also reserve the
                right to delete files, data, or information uploaded by You if We deem that they
                are not in compliance with these Terms of Use, or if We think they are not suitable
                or appropriate for the Platform or the Service.
              </p>
            </Section>

            <Section id="fees" title="Fees">
              <Sub>4.1</Sub>
              <p>
                By using the Service, You shall pay to Us the fees corresponding to the Services
                contracted.
              </p>
              <p>
                Additionally, You will receive 100% of Net Income, unless otherwise mutually
                agreed, that We actually receive from Digital Music Services from the exploitation
                of End User Content. (Net Income is defined as all income received after deducting
                licensing fees, administration fees, deductions from stores and service partners,
                and taxes). If a custom agreement is applicable, You authorize Us to deduct sales
                commission per an agreed-upon percentage from the Net Incomes received by Us from
                Digital Music Services.
              </p>

              <Sub>4.2</Sub>
              <p>
                All payments and associated claims: (i) will be made through the corresponding
                &quot;Wallet&quot; section of the Platform; (ii) will be made in the currency
                stated by Us; and (iii) will be payable via PayPal, Venmo (a Paypal Service limited
                to United States residents), Bank Transfer (a Stripe service) and Manifest Payments
                to the account designated by You. If any authority imposes a duty, tax, levy, or
                fee, You agree to pay that amount or supply exemption documentation.
              </p>
              <p>
                Payment of generated sales fees under these Terms of Use shall be made on a “On
                demand” basis within sixty (60) days of receipt of an out payment request from You,
                provided always that the due amount exceeds the corresponding minimum payment
                threshold for the relevant requested payout. Nonetheless, You authorize Us to
                withhold any payment during an additional period of twenty-four (24) months in the
                event We deem that such payment contains incomes or fees totally or partially
                generated fraudulently or contravening these Terms of Use or the Anti-Fraud Policy.
                Any payment You receive from Us will be subject to all and any applicable taxes
                (including VAT, withholding taxes, etc.).
              </p>
              <p>
                The payment of an invoice by Us will not later prevent Us from disputing the
                invoiced amounts pursuant to any rights herein. We may recoup any amounts due to Us
                from You by withholding such amounts from any fees otherwise due in the future and
                providing notice thereof.
              </p>

              <Sub>4.3</Sub>
              <p>
                If any Digital Music Service deducts any amount due to any passed contingency,
                overpayment or conclusion in relation to End User Content or an investigation by Us
                reasonably demonstrates that any of Your fees for any prior month should have been
                lesser, We may, at the conclusion of such investigation and at our sole discretion,
                provide a revised sales report for the applicable month(s) and deduct the
                corresponding amount from future payments, which You acknowledge and accept.
              </p>

              <Sub>4.4</Sub>
              <p>
                You expressly and irrevocably authorize Us to collect all incomes from the
                exploitation of End User Content through the Platform, including but not limited to
                author’s rights, performing and recording rights, any levy established by law for
                private copies, and/or for any other concept without limitation. For this purpose,
                We may ask You to sign a specific authorization letter of direction as solicited by
                the corresponding Performing Right Organization, which You undertake to provide as
                soon as requested by Us.
              </p>

              <Sub>4.5</Sub>
              <p>
                We will make any corresponding invoices and receipts, including mandatory taxes,
                available to You according to the applicable regulations.
              </p>

              <Sub>4.6</Sub>
              <p>
                We reserve the right to change and adjust the Service price, the sales commission
                percentage or the minimum payment threshold, in which case the new terms will be
                notified to You not less than thirty (30) days prior to the effective date and will
                be applicable to future incomes.
              </p>

              <Sub>4.7</Sub>
              <p>
                We may decide not to charge You initially for the use of the Service and any
                optional services, however, You authorize Us to deduct the corresponding amounts
                from Your future payments.
              </p>
              <p>
                In the event that after one year from the start of the relationship, You have
                distributed End User Content on credit, without having generated enough sales to
                pay back the outstanding balance, We reserve the right to request the payment of
                the outstanding balance on demand.
              </p>

              <Sub>4.8 Refunds</Sub>
              <p>
                There are absolutely no refunds for subscription fees. However, You can cancel Your
                subscription at any time via the &quot;Billing&quot; page of the &quot;User
                Portal&quot; on the Platform. For Cover Song Licensing, the refund policy from
                EasySongLicensing.com applies:{' '}
                <a
                  href="https://www.easysonglicensing.com/pages/about-us/refund-policy.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium underline underline-offset-2 break-all hover:text-gray-700"
                >
                  https://www.easysonglicensing.com/pages/about-us/refund-policy.aspx
                </a>
                .
              </p>
            </Section>

            <Section id="duration" title="Duration and Termination">
              <Sub>5.1</Sub>
              <p>
                The duration of our contractual relationship is initially undetermined. It shall
                begin when registering at the Platform and upon the explicit acceptance of these
                Terms of Use, and You or Us may elect to terminate the Service at any time by
                providing notice, in accordance with these Terms of Use, of thirty (30) days from
                the termination date.
              </p>
              <p>
                In the event of termination, You must pay all outstanding amounts to Us in a
                maximum period of five (5) days from the notification date or We will transfer to
                You any positive balance, whichever is the case. Prior to requesting the
                termination, You must remove all Content from the Digital Music Service using the
                “Takedown” functionality that is available to You within the Platform. Moreover, in
                the event of termination, You authorize Us to suspend Your account, block Your
                access to Your account and delete all the files and information uploaded by You to
                the Platform. The termination shall not affect the accrued rights and obligations
                of the parties at the date of termination.
              </p>

              <Sub>5.2</Sub>
              <p>
                Additionally, We will have the right to terminate Our relationship with You and
                cease the Service: (a) if You become the subject of any proceeding related to Your
                liquidation or insolvency (whether voluntary or involuntary) which is not dismissed
                within sixty (60) days; (b) If You infringe our Intellectual Property Rights; (c)
                If You infringe our Anti-Fraud Policy, (d) if You commit any unlawful activity
                using the Platform or the Service, (e) if any outstanding balance is not paid as
                per Section 4.7 or (f) If You breach any term or condition established by Us (here
                or in any other document accepted by You) and You fail to remedy such breach within
                forty-eight (48) hours of the date of notice from Us.
              </p>

              <Sub>5.3</Sub>
              <p>
                In all cases of termination, all costs due for any Service provided by Us until the
                termination date, must be duly paid by You.
              </p>

              <Sub>5.4</Sub>
              <p>
                We will not be liable to You for damages of any kind because of the termination of
                our relationship in accordance with these Terms of Use. Our respective rights and
                obligations contained in sections that by their nature are intended to survive,
                will survive the termination of this relationship.
              </p>

              <Sub>5.5</Sub>
              <p>
                If End User intends to remove End User Content, End User must issue a Takedown, as
                made available on the Platform. If applicable, Takedown fees must be paid and
                processed prior to redistribution and/or account suspension.
              </p>
              <p>
                Regardless the termination of the Service, You and We agree to maintain in force
                those contracts signed by Us with third parties before receiving the notification
                of termination in the event the contracts with such third parties would be still in
                force.
              </p>
            </Section>

            <Section id="ip" title="Intellectual Property Rights">
              <Sub>6.1</Sub>
              <p>
                The Platform and its entire contents, features, and functionality (including but
                not limited to all information, software, text, displays, images, video, and audio,
                and the design, selection, and arrangement thereof) are owned by Us, our licensors,
                or other providers of such material and are protected by United Kingdom and
                international copyright, trademark, patent, trade secret, and other intellectual
                property or proprietary rights laws. Nothing contained herein shall be construed as
                granting or conferring any property rights in the Platform or any part thereof to
                You. We are not granting to You, by means of this Terms of Use, the right to use
                our intellectual property whether for commercial or non-commercial purposes. All
                these rights are expressly reserved by Us and, consequently, We will retain all
                licensed or ownership rights to the Platform, our brands, technology, etc.,
                together with any complete or partial copies thereof.
              </p>

              <Sub>6.2</Sub>
              <p>
                When You upload any of End User Content to our servers through the Platform, You
                are recognizing the following: (a) that We are authorized to exploit, directly or
                through third parties, End User Content (including the recordings, videos,
                compositions, artwork, etc.) through the Digital Music Services selected by You, in
                the entire world and during the duration of our relationship (including section
                5.4); (b) that You own and/or control all rights in and to the End User Content
                and/or have the full right and ability to upload End User Content and exploit it in
                the terms described herein; (c) that End User Content does not infringe the
                copyrights or any other right, of any third party; and (d) that We are authorized
                during the Duration of the agreement to grant to third parties synchronization
                licenses of End User Content for the entire world.
              </p>

              <Sub>6.3</Sub>
              <p>
                If any of End User Content uses any kind of the so-called “copyleft license” and
                such content was created or developed by a person (including artists and producers)
                which are not associated to any Performing Rights Organization (such as but not
                limited to SESAC, BMI or ASCAP in the USA, SACEM in France, MCPS in UK, SGAE in
                Spain, GEMA in Germany, etc.) in any country of the world, upon the compliance of
                Section 4.4 above, then You authorize Us to claim on their behalf, where
                appropriate, to the Performing Rights Organization of each country, any royalties,
                levies, duties, etc. that Digital Music Services have paid in respect with such
                content.
              </p>

              <Sub>6.4</Sub>
              <p>
                You must indicate through the Platform the name of the record label (associated
                with the phonographic producer) for each release or phonogram that You intend to
                distribute in any country in the world using the platform (phonographic producer
                that is associated with any Collective Management Society (CMO), as for example
                SCPP in France, PPL in the United Kingdom, AGEDI in Spain, CAPIF in Argentina,
                etc.). In contrast, if any of End User Content is distributed using any “Public
                Label Name” available on the platform, You agree, in accordance with the provisions
                of section 4.4 above, with the following:
              </p>
              <p>
                You authorize and facilitate the transmission by You to Us and the acquisition by
                Us from You of the following rights as associated with End User Content (sound
                recordings, compositions, music videos, etc.): (a) Reproduction Rights and/or (b)
                Public Communication or Public Performance Rights distributed using the platform.
                You authorize Us to claim in Your name, as appropriate, to the Collective
                Management Society (CMO) of each country, any rights, charges, obligations, etc.
                that those have collected with respect to said content.
              </p>
            </Section>

            <Section id="fraud" title="Fraud">
              <Sub>7.1</Sub>
              <p>
                We work very hard and invest extensive resources to avoid automated and fraudulent
                behaviors. For this reason, We have created a specific Anti-Fraud Policy, that is
                available in the footer section of this site.
              </p>
              <p>
                When You accept these Terms of Use, You also specifically acknowledge and accept
                our Anti-Fraud Policy and, therefore, You accept that, among other commitments, You
                will not individually and will not authorize any third party to, directly or
                indirectly, generate automated, fraudulent, or otherwise invalid playback actions,
                especially in Digital Music Services.
              </p>

              <Sub>7.2</Sub>
              <p>
                In this Anti-Fraud Policy We have implemented a 3-strike policy. Please read this
                policy carefully. We will be very strict in applying it.
              </p>
            </Section>

            <Section id="privacy" title="Privacy">
              <Sub>8.1</Sub>
              <p>
                Our data protection policy is described in the Privacy Policy. The Privacy Policy
                is part of our relationship and, therefore, when You accept these Terms of Use You
                are also acknowledging and accepting our Privacy Policy, and also our Cookie
                Policy. The Privacy Policy and our Cookie Policy are available in the Footer
                section of our website.
              </p>
            </Section>

            <Section id="warranty" title="Warranty, Limitation of Liability">
              <Sub>9.1</Sub>
              <p>
                We cannot warrant to You that the Platform and the Service will meet Your
                requirements. Except as expressly provided in these Terms of Use, We provide the
                Services and the Platform “as is” and without warranty. We disclaim all other
                warranties, express or implied, including the implied warranties of
                non-infringement, merchantability, and fitness for a particular purpose. The
                Platform cannot be tested in every possible operating environment, therefore We do
                not warrant that the functions contained in the Platform will meet Your
                requirements, that operation of the Platform will be uninterrupted, or that the
                Platform is error free. Except as set forth herein and to the extent permitted by
                law, all other warranties, expressed or implied, statutory or otherwise, including,
                but not limited to, implied warranties of merchantability, quality, and fitness for
                a particular purpose are excluded on the part of Us. Neither Us nor any of our
                third-party suppliers or partners shall be liable for any injury, loss or damage,
                whether indirect, special, incidental or consequential nor for any lost profits,
                contracts, loss of data or programs, the cost of recovering such data, or
                incorrect, defective or faulty performance of End User Content.
              </p>

              <Sub>9.2</Sub>
              <p>
                You agree to defend, indemnify, and hold harmless Us, our affiliates, licensors,
                and service providers, and our and their respective officers, directors, employees,
                contractors, agents, licensors, suppliers, successors, and assigns from and against
                any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or
                fees (including reasonable attorneys&apos; fees) arising out of or relating to Your
                violation of these Terms of Use or Your use of the Platform, including, but not
                limited to, the End User Content, any use of the Platform’s content, services, and
                products other than as expressly authorized in these Terms of Use, or Your use of
                any information obtained from the Platform.
              </p>

              <Sub>9.3</Sub>
              <p>
                Our liability under or in connection with the Platform and the Service (including
                damages) whether arising from negligence, breach of contract or otherwise shall be
                limited to the value of the fees paid by You to Us during the 12 months prior to
                the claim. You hereby acknowledge that such monetary damages are sufficient for any
                damages that may be suffered by You in connection with the Service and specifically
                waive any right to injunctive relief or any damages other than those listed in this
                Section 9.3.
              </p>

              <Sub>9.4</Sub>
              <p>
                We shall not be liable for any loss of, whether arising directly or indirectly, (a)
                profits, (b) savings, (c) goodwill, (d) reputation, (e) revenue, (f) anticipated
                savings, (g) business or opportunity or (h) any other like pure economic loss; nor
                any special, indirect, consequential or incidental losses or damages of any kind or
                nature whatsoever regardless of whether in each case arising from breach of
                contract, warranty, tort, strict liability, negligence or otherwise, even if
                advised of the possibility of such loss or damage, or if such loss or damage could
                have been reasonably foreseen.
              </p>

              <Sub>9.5</Sub>
              <p>
                We respect the rights of others (including copyright, image and personality rights,
                etc.) and expect our clients to do the same. In compliance with the European
                Directive on Liability of Internet Service Providers, We will respond expeditiously
                to remove or disable access to material uploaded by users of the Platform and/or
                the Service that is claimed to infringe third parties’ rights.
              </p>
            </Section>

            <Section id="priority" title="Priority Accounts">
              <p>
                In our discretion, We may offer to sign You up for an exclusive account that gives
                You priority features (“Priority Account”). Unless otherwise specified, a Priority
                Account will be subject to the Terms of Use. Priority Accounts will have additional
                term features that will be specified in our Priority Account offer, including,
                without limitation, the following:
              </p>

              <Sub>10.1</Sub>
              <p>
                The term of a Priority Account shall consist of an initial one (1) year period plus
                a mandatory first rolling period that will end on December 31 of the same calendar
                year. For example purposes only, if Your Priority Account begins on May 1, 2023,
                the earliest the term would end is December 31, 2024. The deadline to give Us
                written notice would be no later than March 1, 2024 (this is 60 days prior to the
                end of the initial 1-year period) and the term would continue through the mandatory
                first rolling period (eight (8) more months until December 31, 2024). If You missed
                the March 1, 2024 deadline then the term would automatically extend for a new
                calendar year through December 31, 2025.
              </p>
              <p>
                The purpose of the mandatory first rolling period is to have all our Priority
                Accounts eventually be on the same calendar accounting period (January 1 –
                December 31).
              </p>

              <Sub>10.2</Sub>
              <p>
                Thereafter, additional extension periods will automatically extend the term for one
                (1) year unless You notify Us in writing at least sixty (60) days before the end of
                the then-current extended period that You do not want to extend the term for a new
                1-year extension period.
              </p>

              <Sub>10.3</Sub>
              <p>
                Following Your initial release of music, You agree that We shall have a first right
                of refusal for all subsequent music releases during the term of Your Priority
                Account. For clarity purposes, this means that when You desire to release any music
                during Your Priority Account Term, You will release it on the Platform, unless:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  You send Us a written request that You want to release the project with a third
                  party and
                </li>
                <li>
                  We send You written notice that You may release the project with a third party
                  (and We will specify any conditions, holdbacks, or restrictions that apply).
                </li>
              </ol>
            </Section>

            <Section id="miscellaneous" title="Miscellaneous">
              <Sub>11.1 Assignment</Sub>
              <p>
                We may freely assign any or all of our rights or obligations under these Terms of
                Use. You may not assign, in whole or in part, nor transfer or sub-license Your
                rights under these Terms of Use, to any third party without our express prior
                written consent.
              </p>

              <Sub>11.2 Severability</Sub>
              <p>
                If any provision of this Agreement is found invalid or unenforceable, that
                provision will be enforced to the maximum extent permissible, and the other
                provisions of this Agreement will remain in force.
              </p>

              <Sub>11.3 Promotion</Sub>
              <p>
                We are not obliged to effectuate any online promotion and/or marketing of End User
                Content under these Terms of Use. However, We may offer complimentary promotional
                services which You may contract separately.
              </p>

              <Sub>11.4 Notifications</Sub>
              <p>
                Any notice that You or Us need to effectuate in connection with the development and
                performance of these Terms of Use shall be, whichever their object, by mail,
                digital notification (available on the &quot;Notification&quot; page of the
                platform) or email at the addresses listed on Your account on the Platform and, to
                Us, to any of the following means:
              </p>
              <address className="not-italic rounded-xl bg-gray-50 border border-gray-200 p-4">
                <p className="font-semibold text-black">Rdistro Ltd</p>
                <p>London, England EC1V 2NX</p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:support@rdistro.net"
                    className="text-black font-medium underline underline-offset-2 hover:text-gray-700"
                  >
                    support@rdistro.net
                  </a>
                </p>
              </address>

              <Sub>11.5 Amendments</Sub>
              <p>
                We may amend this Terms of Use, the Anti-Fraud Policy, the Cookie Policy, the
                Privacy Policy or any other legal document from time to time, in which case the new
                terms will supersede prior versions. We will notify You not less than ten (10) days
                prior to the effective date of any such amendment and Your continued use of the
                Service and/or the Platform following the effective date of any such amendment may
                be relied upon by Us as Your consent to any such amendment. Our failure to enforce
                at any time any provision of these Terms of Use, the Anti-Fraud Policy, the Privacy
                Policy, the Cookie Policy or any other legal document does not constitute a waiver
                of that provision or of any other provision of our terms.
              </p>

              <Sub>11.6 Confidentiality</Sub>
              <p>
                In the event We provide any kind of information to You (including but not limited
                to statistics of the Platform, performance KPIs, marketing material, etc.) You
                agree to treat such information as confidential and in no event shall be utilized
                (for its benefits or for third parties), disclosed, transmitted to third parties or
                made public in any way by You without our prior written agreement.
              </p>

              <Sub>11.7 Law and Jurisdiction</Sub>
              <p>
                This Agreement shall be governed and construed in accordance with the laws of the
                United Kingdom. When valid by law, any dispute, controversy or claim arising under,
                out of or relating to this contract and any subsequent amendments of this contract,
                including, without limitation, its formation, validity, binding effect,
                interpretation, performance, breach or termination, as well as non-contractual
                claims, shall be referred to and finally determined by arbitration in accordance
                with the WIPO Arbitration Rules. The arbitral tribunal shall consist of a sole
                arbitrator. The language to be used in the arbitral proceedings shall be English.
                You waive any and all objections to the exercise of jurisdiction over You by such
                courts and to the venue in such courts. ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE
                ARISING OUT OF OR RELATING TO THESE TERMS OF USE OR THE PLATFORM MUST BE COMMENCED
                WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES; OTHERWISE, SUCH CAUSE OF
                ACTION OR CLAIM IS PERMANENTLY BARRED.
              </p>

              <Sub>11.8</Sub>
              <p>
                All notices of copyright infringement claims should be sent to the copyright agent
                designated in our Copyright Policy in the manner and by the means set out therein.
              </p>

              <Sub>11.9</Sub>
              <p>
                The Platform is controlled, operated, and administered by Us from our offices
                within the United Kingdom. We make no representation that the content is
                appropriate or available for use outside the United Kingdom, and access to it from
                territories where it is illegal or improper is prohibited. You may not use the
                Platform to export any content violating United Kingdom export laws and
                regulations. If You access the Platform from a location outside the United Kingdom,
                You assume sole responsibility for compliance with all applicable UK and local
                laws.
              </p>

              <Sub>11.10</Sub>
              <p>
                For Cover Song Licensing, the Terms of Service applying to cover song licensing
                through EasySongLicensing.com are incorporated herein by this reference and can be
                found on their site at{' '}
                <a
                  href="https://www.easysonglicensing.com/pages/about-us/terms-of-use.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium underline underline-offset-2 break-all hover:text-gray-700"
                >
                  https://www.easysonglicensing.com/pages/about-us/terms-of-use.aspx
                </a>
                .
              </p>

              <p className="pt-4">
                If You have any doubts or queries about these Terms of Use or any documents that
                govern the Platform, please contact us by email at{' '}
                <a
                  href="mailto:support@rdistro.net"
                  className="text-black font-medium underline underline-offset-2 hover:text-gray-700"
                >
                  support@rdistro.net
                </a>
                .
              </p>
            </Section>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
