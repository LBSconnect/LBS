var COURSE_DATA = {
  "title": "Strategy Analysis & BA Career Readiness",
  "slides": [
    {
      "img": "d10-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d10-2.jpg",
      "notes": [
        "Welcome to the final course in this program: Strategy Analysis and BA Career Readiness. We opened this series in course one talking about the BABOK's six knowledge areas, and we've spent the last nine courses going deep on most of them. This closing course does two things. First, it covers Strategy Analysis, the knowledge area we deliberately saved for last, because it's easiest to understand once you've seen the detailed, ground-level work it connects to. Second, once the curriculum itself is complete, we turn entirely to your career - building a portfolio and preparing you to walk into a BA interview with confidence.",
        "By the end of this hour, you'll be able to define Strategy Analysis and describe its three core activities: understanding the current state, defining a desired future state, and assessing the risks in between. You'll know how to build a basic gap analysis, connecting those two states in a way that directly informs a business case. You'll understand Agile Analysis - how the same strategic thinking gets applied inside fast, iterative delivery through lean business cases and MVP thinking, rather than a single large upfront strategy document. You'll know how to assemble a portfolio that actually demonstrates the deliverables you've learned to build across this program. You'll be able to answer common BA interview questions using the STAR method. And you'll leave with a practical mock-interview routine you can run yourself, plus a clear sense of where to keep growing after this program ends.",
        "Let's start at the top: what exactly is Strategy Analysis, and why does it matter?"
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d10-3.jpg",
      "notes": [
        "Strategy Analysis is the BABOK knowledge area concerned with understanding why an organization needs to change, what needs to change, and how to plan for that change to actually succeed - it's the discipline that keeps requirements work anchored to genuine business value, rather than becoming a list of features disconnected from any real strategic purpose. It has three core activities, and they build on each other in sequence.",
        "The first is analyzing the current state - understanding the organization, or the specific part of it relevant to this initiative, as it exists today. This includes the business processes we mapped in course six, the pain points and inefficiencies surfaced through elicitation in course two, and the broader business environment - competitive pressures, regulatory requirements, technology constraints - that shapes what's realistically possible. A thorough current-state analysis prevents a very common strategic mistake: designing a beautiful future state that ignores a real constraint, like a legacy system dependency or a regulatory requirement, that later turns out to make the plan infeasible or far more expensive than assumed.",
        "The second activity is defining the future state - the desired condition once the change has been successfully implemented, expressed in terms of business capabilities and outcomes rather than specific solution features. This connects directly to the business requirements from course one: a future state might be described as 'customer service agents can resolve a routine inquiry in under three minutes, using a single unified view of the customer,' which is a capability and outcome statement, not yet a decision about which specific system or feature delivers it. The gap between the current state and this future state - what's missing, what needs to change, what capabilities don't yet exist - is the gap analysis, and it becomes the backbone of the business case: the gap is essentially the scope of work the initiative needs to close.",
        "The third activity is risk assessment - identifying what could prevent the organization from successfully closing that gap. This includes risks to the change itself, like organizational resistance to a new process, insufficient budget, or a lack of critical skills on the team, and risks the change is exposed to externally, like a competitor moving faster, or a regulatory shift that could invalidate assumptions built into the future state. A well-built strategy analysis doesn't just describe an appealing destination; it honestly names the obstacles between here and there, which is exactly what makes a business case credible to a skeptical sponsor or investment committee, rather than reading as pure optimism.",
        "Let's add one more practical tool used within current-state analysis: a SWOT-style scan, examining internal Strengths and Weaknesses alongside external Opportunities and Threats relevant to the initiative. This isn't a rigid template to fill in mechanically, but a useful checklist to make sure you're considering factors beyond the immediate process under review - a competitor's recent move, an upcoming regulatory change, or an internal skills gap can all shape what future state is realistically achievable, and all deserve consideration alongside the more detailed process and stakeholder analysis covered earlier in this program."
      ]
    },
    {
      "img": "d10-4.jpg",
      "notes": [
        "You might reasonably ask: doesn't a full current-state, future-state, gap, and risk analysis sound like exactly the kind of heavyweight, upfront work that Agile, from courses seven and eight, tries to avoid? This is precisely the tension that Agile Analysis addresses - applying the same strategic discipline, but at a scale and pace that fits iterative delivery, rather than abandoning strategic thinking altogether in the name of speed.",
        "The most common practical tool here is the lean business case - a condensed, often single-page version of the strategic thinking we just covered, capturing the core problem, the target outcome, the key assumptions, and the biggest risks, without the exhaustive detail of a traditional strategy document. A lean business case is meant to be revisited and refined as the team learns, rather than locked down once at the very start, which mirrors the 'responding to change over following a plan' value from the Agile Manifesto in course seven.",
        "The second major concept is MVP thinking - MVP standing for Minimum Viable Product. Rather than fully specifying the entire future state before building anything, as a traditional strategy analysis and a full FRD might encourage, Agile Analysis favors identifying the smallest slice of the future state that can be built, delivered, and learned from quickly - proving or disproving key assumptions about value with real users, real data, and minimal upfront investment, before committing further resources to build out the rest. This connects directly to the incremental delivery ideas from course seven: rather than one large strategic bet, the organization makes a small bet, learns from it, and adjusts the strategy itself based on what's learned - sometimes called a 'walking skeleton' approach, where an early, thin version of the whole solution goes live end-to-end, and each iteration adds real capability to that skeleton rather than perfecting one piece in isolation.",
        "The third concept is continuous discovery - treating strategic analysis not as a phase that happens once before delivery begins, but as an ongoing activity running in parallel with delivery, informed by real usage data and ongoing stakeholder feedback from Sprint Reviews and other touchpoints. In this model, the gap analysis is never really 'finished' - it's continuously refined as the team learns more about what's actually working, which is a natural extension of everything we've covered about how Agile changes the rhythm, but not the underlying discipline, of BA work.",
        "It's worth naming a tension many organizations wrestle with as they adopt Agile Analysis: leadership and finance functions often still want a confident, fixed-scope estimate of total cost and timeline before approving an initiative, which sits uneasily alongside Agile's premise that the fine details will only become clear as the team learns. A common resolution is separating the decision to invest from the decision of exactly what gets built - leadership approves a bounded budget and time horizon based on the lean business case and target outcome, while the specific scope within that boundary is refined continuously through the Agile process itself, with regular checkpoints, often tied to Sprint Reviews, where leadership can see real progress and decide whether to continue, adjust, or stop investing further."
      ]
    },
    {
      "img": "d10-5.jpg",
      "notes": [
        "Let's make this concrete with a worked example, tying together nearly everything from this program into a single one-page artifact. Imagine you're the BA on an initiative to improve customer support at a mid-sized retailer.",
        "Problem Statement, drawn from current-state analysis: customer service agents currently need an average of eight minutes to resolve a routine order inquiry, because customer data lives across three disconnected systems, and this is driving both high support costs and declining customer satisfaction scores. Target Outcome, the future state: agents can resolve a routine order inquiry in under three minutes using a single unified customer view, improving both cost efficiency and customer satisfaction. Key Assumptions: that consolidating data access, rather than replacing the underlying systems entirely, is sufficient to achieve this outcome, and that agents will adopt a new unified interface with minimal additional training. Gap or Scope: the organization needs a new interface layer that pulls from all three existing systems, likely delivered as a phased initiative given the technical complexity of the integrations involved. Risks: the integration with the oldest of the three systems may be more technically complex than initially estimated, and agents may resist changing a workflow they've used for years, echoing the stakeholder resistance patterns from course three.",
        "Success Metrics, connecting back to course four's discipline of measurable business requirements: average resolution time drops to under three minutes within two quarters of full rollout, and customer satisfaction scores for support interactions improve by a specific, agreed percentage over the same period.",
        "Now, applying Agile Analysis thinking to this same case: rather than building the full three-system integration before anything ships, an MVP approach might deliver a unified view for just the two simpler system integrations first, as a walking skeleton, measuring the actual improvement in resolution time and agent adoption before committing to the harder, riskier third integration. This tests the core assumption - that a unified view meaningfully improves resolution time - with a smaller initial investment, and the results directly inform whether and how to proceed with the more difficult remaining work, rather than betting the entire initiative on an assumption that hasn't yet been validated with real usage.",
        "Notice how this single-page artifact pulls together stakeholder needs from course three, business requirements language from course one and four, and risk thinking, all in a format light enough to fit on one page and be revisited every few sprints - this is Agile Analysis in practice."
      ]
    },
    {
      "img": "d10-6.jpg",
      "notes": [
        "Let's shift now from curriculum content to your career, starting with something concrete you can build immediately: a portfolio. Whether you're breaking into your first BA role or moving from a related role into BA work formally, a portfolio of realistic work samples is one of the strongest signals you can offer a hiring manager, because it demonstrates capability directly rather than asking them to take your resume's word for it.",
        "Here's a practical portfolio checklist, built directly from this program. Include a sample excerpt from a BRD and an FRD - even for a fictional or practice scenario - showing you understand the distinction and structure from course four, including testable, well-written requirement statements. Include a set of user stories with full Given, When, Then acceptance criteria from course five, ideally showing a story that's been appropriately split using the INVEST criteria. Include a process map - either a swimlane diagram or a BPMN diagram from course six - ideally showing both an as-is and a to-be version side by side, since that comparison is one of the most persuasive artifacts you can show a reviewer. Include a stakeholder communication plan from course three, demonstrating that you think about audience, channel, and cadence deliberately rather than treating communication as an afterthought. And if you've worked through the material in course nine, include a SQL query example and a simple Power BI report screenshot, since data literacy increasingly differentiates candidates in a competitive market.",
        "For each portfolio piece, write a short paragraph of context: what business problem the artifact addresses, what technique you used and why, and what you'd highlight about your own thinking process. This context matters as much as the artifact itself, because it demonstrates that you understand why you made the choices you made, not just that you can produce a document that looks the right shape. If you don't yet have real project experience to draw from, build these artifacts around a plausible, clearly-labeled practice scenario - a hiring manager evaluating an entry-level candidate expects this, and a well-constructed practice example, thoughtfully explained, is genuinely compelling evidence of skill.",
        "One more portfolio-building tip worth naming: don't wait until you feel like an expert to start. A portfolio built from thoughtfully constructed practice scenarios, clearly labeled as such, demonstrates real capability to a hiring manager evaluating an entry-level candidate, and it's far better to have three honestly-labeled practice artifacts than zero artifacts because you were waiting for real project experience that hasn't arrived yet. As real project work does come your way, gradually replace practice examples with real ones, always respecting confidentiality by removing or fictionalizing any sensitive company details."
      ]
    },
    {
      "img": "d10-7.jpg",
      "notes": [
        "Let's close with interview preparation. BA interviews typically mix two question types: knowledge questions, testing whether you understand concepts like the ones covered throughout this program, and behavioral questions, asking you to describe how you've actually handled a real or realistic situation. Knowledge questions are best prepared for by genuinely understanding this material, which is exactly what the previous nine courses were for. Behavioral questions benefit enormously from a specific structure: the STAR method.",
        "STAR stands for Situation, Task, Action, Result. Situation briefly sets the context - what project, what circumstance. Task states what you specifically needed to accomplish or the problem you needed to solve. Action describes, in real detail, what you actually did - and this is the part candidates most often rush through, when it's actually the part interviewers care about most, because it reveals how you think and work. Result states the outcome, ideally with a specific, even if modest, measurable detail, and a brief note on what you learned, especially if the result wasn't entirely positive.",
        "Let's apply this to a common BA interview question: 'tell me about a time you had to clarify a vague or conflicting requirement.' Situation: on a practice project simulating a retail returns process, two stakeholder groups described the return eligibility window differently. Task: I needed to resolve the discrepancy and document a single, clear, authoritative requirement before the team could proceed with the functional specification. Action: I went back to each stakeholder individually first, using the interview techniques and open questioning we covered in course two, to understand not just what each believed the rule was, but why - which surfaced that one group was describing an old, outdated policy. I then brought both stakeholders together in a short workshop to confirm the correct, current rule and get explicit agreement, rather than deciding myself which version was correct. Result: we documented a single, unambiguous requirement with clear sign-off, which prevented a defect that likely would have surfaced later in testing or, worse, after launch, and I learned to always ask 'why' a rule exists, not just 'what' it is, because that's often where hidden discrepancies come from.",
        "A few more common question categories worth preparing STAR answers for, ideally two or three real or realistic examples for each: a time you had to manage competing stakeholder priorities, drawing on course three; a time you had to simplify a complex process for a non-technical audience, drawing on course six; a time requirements changed significantly mid-project and how you adapted, drawing on courses one, seven, and eight; and a time you used data to challenge an assumption or validate a decision, drawing on course nine. Practice these out loud, not just in your head - the words come out differently when you actually speak them, and rehearsing that difference before the real interview is worth the mild discomfort of talking to yourself.",
        "Let's add one more practical technique for interview preparation: recording yourself answering a STAR question out loud, then watching or listening back. This can feel uncomfortable the first time, but it reliably surfaces habits you can't notice while you're busy formulating the answer in the moment - rambling instead of a clear Situation and Task, rushing through the Action section that interviewers actually care about most, or forgetting to state a concrete Result. A single round of honest self-review, done a few days before a real interview, often improves answer clarity more than several additional rounds of purely mental rehearsal."
      ]
    },
    {
      "img": "d10-8.jpg",
      "notes": [
        "Let's close out both this course and the entire program. Strategy Analysis connects requirements work to genuine organizational value through current-state analysis, future-state definition, and honest risk assessment - and Agile Analysis applies that same discipline inside iterative delivery through lean business cases, MVP thinking, and continuous discovery, rather than abandoning strategic thinking in the name of speed. A strong BA portfolio, built from the artifacts across this program - requirements documents, user stories, process maps, communication plans, and even basic data work - gives a hiring manager concrete evidence of your capability. And the STAR method turns your experience, even practice experience, into clear, compelling interview answers.",
        "Stepping back across the full ten courses: you started with the foundational discipline of requirements engineering and the BABOK framework, built elicitation and stakeholder skills, learned to write BRDs, FRDs, user stories, and use cases, learned to make process visible through mapping, BPMN, and UML, understood how Agile and Scrum reshape the rhythm of BA work, went hands-on with ceremonies, backlog management, and Kanban, picked up practical SQL and Power BI skills, and just now connected all of it back to organizational strategy and your own career readiness.",
        "My honest advice as you move forward: revisit specific modules the night before a real interview rather than trying to hold all ten courses in your head at once - course one and this closing course are worth a fast re-watch before almost any BA interview, since they cover the vocabulary and framing interviewers most often probe. Build your portfolio piece by piece rather than all at once, and treat every real project you touch, even a small one, as an opportunity to add a genuine, non-fictional artifact to replace the practice examples. Congratulations on completing the Business Analysis and Agile Practitioner series - now go put it to work.",
        "One final, practical closing thought: the field of business analysis keeps evolving, particularly around data literacy and AI-assisted tooling, and the fundamentals in this program are built to remain useful even as specific tools change around them. Elicitation, clear requirements writing, stakeholder empathy, and structured problem-solving don't go out of date the way any single piece of software eventually does - invest in those fundamentals first, and treat new tools, as they emerge, as simply new ways to apply skills you already have."
      ]
    }
  ],
  "quiz": [
    {
      "q": "What are the three core activities of Strategy Analysis?",
      "options": [
        "Elicitation, documentation, and sign-off",
        "Current state analysis, future state definition, and risk assessment",
        "Sprint Planning, Daily Scrum, and Retrospective",
        "BRD writing, FRD writing, and traceability"
      ],
      "correct": 1,
      "explanation": "These three activities build on each other to define the gap an initiative needs to close, and the risks along the way."
    },
    {
      "q": "What is a \"lean business case\" in the context of Agile Analysis?",
      "options": [
        "A business case that is never written down",
        "A condensed, often one-page version of strategic analysis, revisited continuously as the team learns",
        "A legal contract between the business and a vendor",
        "A synonym for a full BRD"
      ],
      "correct": 1,
      "explanation": "It captures the core problem, target outcome, assumptions, and risks without exhaustive upfront detail."
    },
    {
      "q": "What does MVP stand for in the context of Agile Analysis, and what is its purpose?",
      "options": [
        "Most Valuable Player \u2014 recognizing the best-performing team member",
        "Minimum Viable Product \u2014 the smallest slice that tests key assumptions with real users before further investment",
        "Maximum Value Proposition \u2014 the most profitable feature to build first",
        "Managed Vendor Partnership \u2014 an outsourcing arrangement"
      ],
      "correct": 1,
      "explanation": "MVP thinking proves or disproves assumptions about value quickly and with minimal upfront investment."
    },
    {
      "q": "Which of these belongs in a strong BA portfolio, according to this course?",
      "options": [
        "Only a resume with no work samples",
        "A BRD/FRD excerpt, user stories with acceptance criteria, a process map, and a communication plan",
        "Confidential client data copied directly from a past employer",
        "A list of every software tool you have ever opened"
      ],
      "correct": 1,
      "explanation": "Concrete, well-labeled work samples (even practice scenarios) are the strongest signal of real capability to a hiring manager."
    },
    {
      "q": "In the STAR method for behavioral interview questions, which part do candidates most often rush through \u2014 even though interviewers care about it most?",
      "options": [
        "Situation",
        "Task",
        "Action",
        "Result"
      ],
      "correct": 2,
      "explanation": "The Action section reveals how a candidate actually thinks and works, which is exactly what interviewers are trying to assess."
    }
  ]
};
