var COURSE_DATA = {
  "title": "Agile & Scrum Foundations for Business Analysts",
  "slides": [
    {
      "img": "d7-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d7-2.jpg",
      "notes": [
        "Welcome to Agile and Scrum Foundations for Business Analysts. Back in course one, we talked about how requirements engineering doesn't change its core discipline based on the SDLC, but the pacing and documentation absolutely do. This course is where that idea becomes concrete, because Agile, and specifically its most popular framework, Scrum, has become the dominant way software gets delivered across the industry, and it changes the rhythm of BA work more than any other single factor you'll encounter in your career.",
        "By the end of this hour, you'll be able to explain the four values and the key principles behind the Agile Manifesto in plain, practical terms - not as abstract philosophy, but as things that actually change daily behavior on a project. You'll know the three core roles in Scrum and what each one is accountable for. You'll know the three core artifacts Scrum uses to organize work, and how they connect to each other. You'll understand the sprint - Scrum's basic rhythm of delivery - and what happens inside one. And critically, you'll walk away with a clear picture of how your responsibilities as a BA - elicitation, stakeholder management, documentation - map onto this new rhythm, because the discipline doesn't disappear in Agile, it just takes a different shape.",
        "Let's start at the source: the Agile Manifesto itself.",
        "It's also worth noting that Agile fluency has become close to a baseline expectation in BA job postings today, even for roles that aren't purely technology-focused. Employers increasingly assume a candidate can speak comfortably about sprints, backlogs, and ceremonies, which makes this course and the next one some of the most directly employable material in the entire program."
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d7-3.jpg",
      "notes": [
        "In 2001, a group of software practitioners frustrated with the rigidity of heavyweight, Waterfall-style processes wrote a short document called the Agile Manifesto. It states four value statements, each contrasting two things and stating a preference - and it's worth being precise about the wording, because it's often misquoted. The manifesto says: while there is value in the items on the right, we value the items on the left more. It does not say the items on the right have no value at all, and misunderstanding that nuance is one of the most common ways teams misapply Agile.",
        "The first value pair is individuals and interactions over processes and tools. This doesn't mean process and tools don't matter - it means that when a rigid process gets in the way of people actually solving a problem together, the people and the conversation should win. Practically, this shows up as a bias toward a quick conversation over a lengthy change-request form, and toward face-to-face or direct collaboration over routing everything through formal channels.",
        "The second is working software over comprehensive documentation. This is the value most directly relevant to everything we've covered in this program, because it explains why Agile teams favor lightweight user stories, which we covered in course five, over the exhaustive FRDs from course four. It doesn't mean documentation is worthless - non-functional requirements, compliance documentation, and traceability still matter enormously - it means documentation exists to serve the delivery of working software, not the other way around, and a team shouldn't spend more time perfecting a document than building and validating the actual solution.",
        "The third is customer collaboration over contract negotiation. Traditional projects often lock down a fixed scope in a contract at the very start and then treat any change as a formal, often adversarial, negotiation. Agile instead favors ongoing, close collaboration with the customer or product owner throughout the project, on the premise that requirements will legitimately evolve as everyone learns more, and that's a feature, not a failure, of the process.",
        "The fourth is responding to change over following a plan. This doesn't mean Agile teams don't plan - they plan constantly, just at a shorter horizon, revisiting and adjusting frequently rather than committing rigidly to a long-range plan made with the least information you'll ever have, at the very start of a project.",
        "Underneath these four values sit twelve supporting principles, but a few matter especially for BA work. One principle states that the highest priority is satisfying the customer through early and continuous delivery of valuable work, rather than delivering everything at once at the very end. Another states that working software is the primary measure of progress, not a percentage-complete status on a project plan. And another explicitly states that requirements can and should change, even late in a project, because Agile processes harness change for the customer's competitive advantage rather than treating late change purely as a threat to be resisted.",
        "It's worth understanding a bit of the history behind this document, because it explains why it reads the way it does. Seventeen practitioners, from a range of already-existing lightweight methods, gathered in 2001 specifically because they recognized shared frustration with heavyweight processes, even though their individual methods differed in the details. The Manifesto they produced together is deliberately short and value-based rather than a detailed methodology, precisely because the authors wanted to state shared principles without prescribing one single rigid process - which is exactly why multiple frameworks, including Scrum and Kanban, both legitimately claim to be Agile despite looking quite different in practice.",
        "A practical way to test whether a team is actually living these values, rather than just using Agile vocabulary, is to watch what happens when a genuine conflict arises between two of the value pairs. If a team defaults to comprehensive documentation the moment working software would require a slightly uncomfortable conversation with a stakeholder, or defaults to rigidly following an old plan the moment responding to change would require admitting an earlier estimate was wrong, that's a sign the values are being cited rather than practiced. Agile transformation, in most organizations, is far more about genuinely shifting these defaults under pressure than it is about adopting new meeting names or new software tools."
      ]
    },
    {
      "img": "d7-4.jpg",
      "notes": [
        "Scrum is the most widely adopted framework for putting Agile values into practice, and it defines exactly three roles - no more, no less, which is itself a deliberate design choice to keep accountability clear.",
        "The Product Owner is accountable for maximizing the value of the product resulting from the team's work, primarily by managing the Product Backlog, which we'll cover in a moment. The Product Owner decides what gets built and in what order of priority, based on business value, and is the single person the development team turns to for a decision on scope or priority - Scrum deliberately avoids having multiple people with conflicting authority over the backlog, because that ambiguity is exactly what causes the priority-thrashing that slows teams down. This is a critical role to understand for this audience, because on many teams, a Business Analyst either works extremely closely with the Product Owner, or in smaller organizations, actually takes on Product Owner responsibilities alongside traditional BA work - we'll come back to this overlap shortly.",
        "The Scrum Master is accountable for establishing and coaching the team in the Scrum framework itself, and for removing impediments that block the team's progress. The Scrum Master isn't a traditional project manager who assigns tasks; the role is closer to a facilitator and coach, protecting the team's ability to focus and helping the organization understand and properly support Scrum practices. A good Scrum Master notices when a ceremony, which we'll cover in the next course, isn't functioning well and helps the team improve it, rather than simply enforcing attendance.",
        "The Development Team - sometimes just called 'the developers' in newer Scrum terminology, though it includes anyone doing the hands-on work of building the increment, including testers and designers - is a self-organizing, cross-functional group accountable for delivering a potentially releasable increment of product at the end of every sprint. Self-organizing means the team decides how to accomplish the work, rather than being told task-by-task by someone outside the team, and cross-functional means the team collectively has all the skills needed to deliver, without depending on people outside the team for every piece of the work.",
        "Notice what's absent from this list: there's no formal 'Business Analyst' role defined in Scrum itself. This is intentional and important to understand. Scrum is a minimal framework, and it expects organizations to adapt the specifics of who does what within these three roles. In practice, BAs most commonly work very closely alongside the Product Owner, helping to elicit, refine, and document backlog items, or in some organizations, a BA formally holds the Product Owner role itself, particularly when the actual business sponsor doesn't have the time or inclination to manage a backlog day to day.",
        "Let's add a bit more texture to the Product Owner role specifically, since it's the one most directly relevant to BA work. A strong Product Owner needs three things simultaneously: a clear enough vision of what the product should become to make consistent prioritization calls, close enough contact with real users and stakeholders to keep that vision grounded in genuine need rather than personal opinion, and enough availability to the Development Team that questions get answered quickly rather than blocking progress for days. In practice, many Product Owners struggle most with the third requirement, because they're often senior businesspeople with many other responsibilities - which is precisely the gap a BA working closely alongside a Product Owner is so well positioned to help fill, by handling detailed elicitation and story-writing so the Product Owner's more limited time is spent on genuine prioritization decisions rather than detail-gathering."
      ]
    },
    {
      "img": "d7-5.jpg",
      "notes": [
        "Scrum defines exactly three artifacts, and each one represents a commitment to transparency about a different aspect of the work.",
        "The Product Backlog is the single, ordered list of everything known to be needed in the product - features, fixes, improvements, and technical work - and it's never finished as long as the product exists. It's ordered by the Product Owner based on value, risk, dependencies, and other factors, with the most important and most well-understood items at the top. Items near the top of the backlog are typically small and detailed, having gone through the refinement process we'll cover in the next course, while items further down are often larger and less defined - a natural and healthy state called the backlog being 'appropriately fuzzy at the bottom.' This connects directly to the user stories from course five: a healthy Product Backlog is largely made up of well-formed, INVEST-compliant user stories, at least for the items near the top that are coming up soon.",
        "The Sprint Backlog is the subset of Product Backlog items the Development Team selects and commits to delivering within the current sprint, plus a plan for how they intend to deliver them. It's owned entirely by the Development Team, and it's expected to be updated throughout the sprint as the team learns more - it's a working plan, not a static commitment carved in stone on day one.",
        "The Increment is the sum of all the Product Backlog items completed during a sprint, combined with the value of all previous increments - and critically, it must meet the team's Definition of Done, a shared, explicit checklist of quality criteria - such as being tested, reviewed, and deployable - that the team agrees every increment must satisfy before it counts as complete. An increment that doesn't meet the Definition of Done isn't actually finished, no matter how much work went into it, and this is a frequent point of confusion for teams new to Scrum, who sometimes report partial progress on an item as though it were complete.",
        "These three artifacts work together to create transparency at every level: the Product Backlog shows everyone what might be built, the Sprint Backlog shows what the team has committed to build right now, and the Increment shows what has actually been built and verified as done. A BA working alongside a Product Owner is frequently deeply involved in maintaining and refining the Product Backlog, and in verifying that completed Sprint Backlog items genuinely satisfy the Definition of Done, especially the functional correctness aspects that connect back to the acceptance criteria covered in course five.",
        "Let's dwell a moment longer on the Definition of Done, because it's a deceptively powerful concept many teams under-invest in defining explicitly. A weak or unstated Definition of Done leads to exactly the kind of dispute that damages trust between a Development Team and its stakeholders - a story gets marked 'done' in the tracking tool, but it wasn't actually tested against realistic data, or it works on a developer's machine but wasn't verified in the shared testing environment, and stakeholders later discover, often at the worst possible time, that 'done' didn't mean what they assumed it meant. A strong Definition of Done, agreed by the whole team and revisited periodically, typically covers things like code review completion, passing automated and manual tests, meeting the story's specific acceptance criteria, and being deployed to an environment where it can genuinely be demonstrated - and a BA is often the person best positioned to make sure functional correctness against acceptance criteria is explicitly part of that shared definition, not just a technical checklist item."
      ]
    },
    {
      "img": "d7-6.jpg",
      "notes": [
        "Everything in Scrum happens inside a sprint - a fixed, time-boxed period, typically somewhere between one and four weeks, with two weeks being especially common in practice, during which the team creates a done, usable, potentially releasable increment. The fact that a sprint is time-boxed, meaning it always ends on schedule regardless of whether all planned work is finished, is a deliberate design choice: it creates a predictable rhythm and forces regular reflection and re-planning, rather than allowing a single piece of work to expand indefinitely.",
        "A sprint contains a small set of built-in events, often called ceremonies, which we'll explore in full detail in the next course, but let's preview the rhythm here. The sprint begins with Sprint Planning, where the team selects backlog items to pursue and creates an initial plan for how to deliver them - this is where refined, INVEST-ready user stories from the top of the Product Backlog get pulled into the Sprint Backlog. Throughout the sprint, the team holds a brief Daily Scrum, a short daily check-in focused on progress toward the sprint goal and surfacing any impediments. At the end of the sprint, the team holds a Sprint Review, where the increment is demonstrated to stakeholders and feedback is gathered - this is a critical touchpoint for a BA, because it's a formal, built-in opportunity for stakeholder validation, connecting directly to the validation discipline we covered back in course two. Finally, the team holds a Sprint Retrospective, a private team reflection on how the sprint went and what could be improved in how the team works together, separate from what was built.",
        "Once a sprint ends, the next one begins immediately - there's no gap, and importantly, no sprint's plan is meant to be disrupted mid-flight by new work, except in unusual circumstances. This is one of Scrum's key protections for the Development Team: once work is committed for the sprint, it's shielded from constant re-prioritization, which lets the team actually focus and deliver, while all new ideas and re-prioritization happen at the Product Backlog level, to be considered for a future sprint rather than injected into the current one.",
        "It's worth naming a common early-adoption mistake related to sprint length: teams new to Scrum sometimes assume shorter sprints are always better because they sound more agile. In practice, the right sprint length depends on the nature of the work and the team's need for feedback - a one-week sprint suits fast-moving, highly uncertain work where frequent course-correction is valuable, while a three or four-week sprint might better suit work with longer natural cycles, like complex integrations that can't be meaningfully demonstrated in smaller increments. What matters most is consistency once a length is chosen, since a stable rhythm is what makes planning, forecasting, and continuous improvement through retrospectives actually work over time."
      ]
    },
    {
      "img": "d7-7.jpg",
      "notes": [
        "Let's bring this back to you directly, because this is the part that matters most practically. Nothing in Scrum eliminates the need for the skills covered in this entire program so far - elicitation, stakeholder management, clear writing, process mapping. What changes is when and how continuously you apply them.",
        "In a traditional, Waterfall-style project, a BA's elicitation and documentation work is heavily front-loaded: build the complete BRD and FRD, get formal sign-off, then largely hand off to the delivery team. In Scrum, elicitation never really stops - it happens continuously through backlog refinement, ongoing conversations with the Product Owner and stakeholders, and preparation for each sprint's planning session. Rather than one large elicitation effort, you're running a smaller version of the elicitation techniques from course two - interviews, workshops, document analysis - every week or two, in service of keeping the next few sprints' worth of backlog items well-understood and ready.",
        "Stakeholder management, from course three, similarly shifts from a small number of large, formal milestone reviews toward continuous engagement - the Sprint Review every one to four weeks becomes a built-in, recurring stakeholder touchpoint, which is valuable, but it doesn't replace the need for the kind of relationship-building and expectation-management we discussed, especially with 'manage closely' stakeholders who need more frequent contact than the sprint rhythm alone provides.",
        "Documentation shifts from comprehensive, signed-off BRDs and FRDs toward the lighter-weight user stories and acceptance criteria from course five, elaborated just before they're needed rather than exhaustively specified months in advance - a practice sometimes summarized as 'just enough, just in time' documentation. This doesn't mean rigor disappears; non-functional requirements, compliance needs, and traceability still matter, and a good BA working in Scrum still ensures those get captured, just inside the backlog and its refinement process rather than inside a standalone FRD.",
        "And on the question of role overlap: in many organizations, especially smaller ones or those newer to Agile, there's no separately staffed Product Owner, and a BA effectively performs a hybrid role - managing and prioritizing the backlog like a Product Owner while also applying deep elicitation and analysis skills like a traditional BA. Understanding both perspectives, which is exactly what this course has covered, makes you effective in either configuration, and it's genuinely one of the most in-demand skill combinations in the current job market, because it lets an organization avoid staffing two separate roles for smaller Agile initiatives.",
        "Let's close this segment with a word of reassurance for anyone worried that moving into an Agile-heavy environment makes their existing BA skills less valuable. The opposite is closer to the truth. Elicitation, clear writing, stakeholder management, and process thinking are in some ways even more valuable in Agile, precisely because they have to happen continuously, in smaller, faster cycles, rather than once at the start of a long project where mistakes have more time to be caught before real damage is done. An Agile environment has less margin for a poorly elicited requirement to hide unnoticed, because it will surface within one or two short sprints rather than being buried inside a two-hundred-page document for months - which means the discipline you're building throughout this program matters just as much, arguably more, in a fast-moving Agile team as it does in a traditional one."
      ]
    },
    {
      "img": "d7-8.jpg",
      "notes": [
        "Let's recap. The Agile Manifesto values individuals and interactions, working software, customer collaboration, and responding to change - while still recognizing the other side of each pair has real value. Scrum operationalizes those values through three roles - Product Owner, Scrum Master, and Development Team - and three artifacts - Product Backlog, Sprint Backlog, and Increment - all organized around the sprint, a fixed, time-boxed cycle of planning, daily work, review, and retrospective. And your core BA skills - elicitation, stakeholder management, clear documentation - don't disappear in Agile; they become continuous, lighter-weight, and deeply embedded in the sprint rhythm rather than front-loaded into a small number of large, formal efforts.",
        "In the next course, we go deeper into the mechanics of that rhythm: Scrum ceremonies in full detail, how to run effective Sprint Planning and backlog refinement sessions, and Kanban as an alternative Agile framework worth knowing alongside Scrum. See you there."
      ]
    }
  ],
  "quiz": [
    {
      "q": "According to the Agile Manifesto, which is valued MORE (while the other still has value)?",
      "options": [
        "Processes and tools, over individuals and interactions",
        "Comprehensive documentation, over working software",
        "Working software, over comprehensive documentation",
        "Following a plan, over responding to change"
      ],
      "correct": 2,
      "explanation": "The Manifesto values the left side of each pair more, without saying the right side has zero value."
    },
    {
      "q": "Which Scrum role is accountable for maximizing product value by managing and ordering the Product Backlog?",
      "options": [
        "Scrum Master",
        "Development Team",
        "Product Owner",
        "Project Manager"
      ],
      "correct": 2,
      "explanation": "The Product Owner decides what gets built and in what priority order, based on business value."
    },
    {
      "q": "What must an Increment satisfy before it can be considered truly finished?",
      "options": [
        "Sponsor's verbal approval only",
        "The team's Definition of Done",
        "A signature from the Scrum Master",
        "Being demonstrated at the Daily Scrum"
      ],
      "correct": 1,
      "explanation": "An increment that doesn't meet the shared Definition of Done isn't actually finished, regardless of effort invested."
    },
    {
      "q": "What is the primary purpose of the Daily Scrum?",
      "options": [
        "A formal status report for management",
        "Coordination among the Development Team and surfacing impediments",
        "Deciding the sprint's overall priorities",
        "Demonstrating the increment to stakeholders"
      ],
      "correct": 1,
      "explanation": "It's a brief, team-focused coordination check-in, not a management status meeting."
    },
    {
      "q": "How does a BA's elicitation work typically change when moving from Waterfall to Scrum?",
      "options": [
        "Elicitation stops being necessary in Agile",
        "Elicitation becomes a single large effort completed once, at project kickoff",
        "Elicitation becomes continuous, happening through ongoing backlog refinement rather than one big upfront phase",
        "Elicitation is handled entirely by the Scrum Master"
      ],
      "correct": 2,
      "explanation": "In Agile, elicitation never really stops \u2014 it happens in smaller, continuous cycles tied to backlog refinement."
    }
  ]
};
