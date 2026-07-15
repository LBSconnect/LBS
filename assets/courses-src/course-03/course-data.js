var COURSE_DATA = {
  "title": "Stakeholder Management & Communication",
  "slides": [
    {
      "img": "d3-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d3-2.jpg",
      "notes": [
        "Welcome to Stakeholder Management and Communication. In the last two courses, we covered what requirements are and how to elicit them. This course covers something that has to happen before and alongside all of that: figuring out whose input actually matters, how much it matters, and how to keep everyone appropriately informed as the project unfolds.",
        "By the end of this hour, you'll be able to explain what a stakeholder is in the full, precise sense the BABOK uses - not just 'the client' but everyone with a legitimate interest in the outcome. You'll have a repeatable technique for identifying stakeholders so you don't discover a missing decision-maker three weeks before go-live. You'll know how to build and use a power/interest grid to decide who gets a seat at every meeting and who just gets a monthly summary email. You'll understand the difference between managing stakeholders and communicating with them, and why conflating the two causes real problems. You'll be able to build a simple, practical communication plan. And you'll pick up techniques for handling two of the most common frustrations in BA work: stakeholders who disagree with each other, and stakeholders who are hard to pin down or resistant to the project.",
        "Let's start with the foundational question: what exactly is a stakeholder?",
        "It's worth naming why this course follows elicitation rather than preceding it. You could technically identify stakeholders before ever eliciting anything from anyone, and in practice you often do a first pass at exactly that. But real stakeholder mapping deepens considerably once you've actually talked to people, because power and interest are not always where the org chart suggests they are - a mid-level operations lead who says little in meetings can turn out to hold enormous informal influence over whether frontline staff actually adopt a new process, and you often only discover that through the elicitation conversations covered in the last course."
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d3-3.jpg",
      "notes": [
        "The BABOK defines a stakeholder broadly: any group or individual with a relationship to the change, the need behind the change, or the solution that addresses that need. Notice this definition doesn't say 'the person who asked for the project' or 'the person paying for it.' It's much wider than that, and that width is the entire point. A stakeholder can have an interest in the outcome, influence over whether it succeeds, or simply be impacted by it, without ever asking for it or having any formal authority over it.",
        "New analysts almost always under-identify stakeholders, because it's natural to think first of the people who commissioned the project - the sponsor, maybe the department head who requested it. But consider the full range of people who typically matter. There are sponsors and executives who fund and champion the initiative. There are end users, the people who will actually interact with whatever gets built day to day, and they're frequently the group most overlooked, because they often sit lower in the org chart than the people making the funding decision. There's the delivery team - developers, architects, testers - who need requirements precise enough to build against. There's operations and support staff, who will maintain the solution long after the project team has moved on, and who have valuable input about supportability that project sponsors rarely think to provide. There are external partners and vendors, who might be affected by integration points or contractual obligations. And in many industries, there are regulators or compliance functions, whose requirements aren't negotiable and need to be identified early, not discovered during an audit.",
        "So how do you find all of these people systematically, rather than hoping you stumble across them? A few reliable techniques. Start with an organizational chart review - literally look at who sits in departments connected to the process or system in question, at every level, not just leadership. Use document analysis, which we covered in course two - old project charters, policies, and system documentation often name roles and departments you wouldn't otherwise think to include. Ask every stakeholder you do identify: 'who else should be part of this conversation?' This snowball technique is remarkably effective, because people inside an organization usually know their own web of dependencies better than an outsider does. And explicitly check the categories that are most commonly forgotten: end users versus their managers, support and maintenance staff, compliance and legal, and anyone on the losing end of a process change - the people whose job gets harder or whose role gets eliminated. Those last two groups are uncomfortable to seek out, but they are often the source of the most important risks and the most valid objections to a proposed solution.",
        "A practical technique worth adding to your stakeholder identification toolkit is process-based discovery: take the process map you'll learn to build in course six, or even a rough hand-drawn version of it, and literally walk along every step asking 'who touches this step, and who is affected by its outcome?' This technique is particularly good at surfacing the quieter roles - the person who runs a monthly reconciliation report, the team that handles exceptions nobody else wants to deal with - because it's anchored to concrete activity rather than relying on someone thinking to mention a role from memory.",
        "It's also worth explicitly considering stakeholders outside the organization's own walls. Customers themselves are stakeholders, even though they rarely sit in an internal planning meeting, and their needs are often represented secondhand through a product manager, a customer success team, or user research - which makes it especially important to sanity-check that secondhand representation against real customer voice wherever possible, whether through the focus groups and surveys covered in course two, or through direct customer interviews when the initiative and budget allow for it.",
        "Keep a running stakeholder register from day one, even before you've built your power/interest grid, simply listing every name, role, and department you encounter, along with a brief note on why they matter. This sounds trivial, but on any project running more than a few weeks, memory alone will not reliably hold two dozen or more names and roles, and a forgotten stakeholder is a silent risk sitting in your blind spot until it surfaces, usually at an inconvenient moment, as a delayed sign-off or a surprised objection late in the project."
      ]
    },
    {
      "img": "d3-4.jpg",
      "notes": [
        "Once you've identified your stakeholders, you have a new problem: you can't give everyone the same amount of attention, and trying to will exhaust you and dilute your effectiveness with the people who matter most. This is where stakeholder mapping comes in, and the most widely used tool for this is the power/interest grid.",
        "Picture a simple two-by-two grid. The vertical axis is power, or influence - how much this stakeholder can affect the project's direction, funding, or success, whether through formal authority or informal sway. The horizontal axis is interest - how much this stakeholder actually cares about, or is affected by, the outcome. Every stakeholder you've identified gets plotted somewhere on this grid, and the quadrant they land in tells you the engagement strategy to use.",
        "High power, high interest stakeholders go in the 'manage closely' quadrant. These are typically your sponsor and key decision-makers, and they need frequent, detailed engagement - regular one-on-ones, involvement in key decisions, and no surprises. This is usually a short list, often just a handful of people, and it deserves the majority of your relationship-building effort.",
        "High power, low interest stakeholders go in 'keep satisfied.' Think of a senior executive who isn't deeply engaged day to day but whose support you need and whose objection could stall the project instantly if they feel blindsided. These stakeholders need periodic, high-level updates - enough to keep them comfortable and supportive - without overwhelming them with operational detail they haven't asked for and don't want.",
        "Low power, high interest stakeholders go in 'keep informed.' These are often end users or front-line staff who will be significantly affected by the change but don't have formal authority over the project's direction. They deserve regular, meaningful communication and a real channel for feedback, both because it's the right thing to do and because their frontline knowledge, as we discussed in course two, often surfaces requirements and risks nobody else sees. Under-investing here is a common mistake, because these stakeholders have limited formal power but their buy-in - or lack of it - strongly predicts whether an initiative gets adopted once it's delivered.",
        "Low power, low interest stakeholders go in 'monitor.' Minimal effort is appropriate here - occasional, brief updates are enough, and spending significant time engaging this group is usually a poor use of a BA's limited hours.",
        "One important caution: stakeholder position on this grid isn't fixed for the life of the project. A stakeholder with low interest today can become high interest the moment a decision affects their team directly. Revisit your grid periodically, especially at major milestones, rather than building it once at kickoff and filing it away.",
        "A common mistake when first building a power/interest grid is confusing seniority with power in this specific context. A senior director might have enormous general authority in the organization but very little actual influence over this particular initiative, if it falls outside their area and they've delegated it entirely to a subordinate. Power, for the purposes of this grid, means influence over this specific project's direction, funding, or success - not general organizational rank - and getting that distinction right is what keeps your grid genuinely useful rather than just a re-statement of the org chart.",
        "It's also worth building your grid collaboratively rather than purely from your own judgment. Reviewing a draft grid with your project sponsor or a trusted senior colleague often surfaces adjustments - a stakeholder you assumed was low-interest turns out to have strong opinions nobody told you about yet, or a stakeholder you placed in 'manage closely' turns out to defer entirely to someone else's judgment on this topic. Treat the first version of your grid as a hypothesis to be tested and refined, not a final answer.",
        "It's also worth building separate grids for genuinely distinct decision points within a large initiative, rather than assuming one grid serves the entire project equally well. The stakeholders who matter most for deciding overall project scope and budget are often different from the stakeholders who matter most for a specific detailed design decision three months later. A single master grid is a fine starting point, but don't be afraid to build a lightweight, temporary grid for a specific decision if the standard cast of characters doesn't obviously apply to it."
      ]
    },
    {
      "img": "d3-5.jpg",
      "notes": [
        "It's easy to use 'stakeholder management' and 'stakeholder communication' interchangeably, but they're related, distinct disciplines, and understanding the difference will make you noticeably more effective.",
        "Stakeholder management is the broader discipline: building and maintaining relationships, understanding each stakeholder's motivations and concerns, managing their expectations, negotiating competing priorities, and actively working to keep their engagement at the right level for the project's success. It's fundamentally relational and strategic. It asks questions like: does this stakeholder trust the project team? Do they feel heard? Are their concerns being addressed, even if not always resolved in their favor? Are we managing their expectations about scope, timeline, and tradeoffs realistically, rather than letting optimism go unchallenged until it becomes a painful surprise?",
        "Stakeholder communication is one of the primary tools you use to execute stakeholder management, but it's more tactical: deciding what information needs to reach which audience, through which channel, at what frequency, and in what format. Good communication executes a management strategy; it doesn't replace one. You can send a technically perfect weekly status email to a stakeholder and still fail at stakeholder management, if that stakeholder feels ignored on the one issue they actually care about, or if the email is written in language that doesn't match their level of familiarity with the project.",
        "Here's a concrete way to see the distinction. Suppose a key operations stakeholder is quietly unhappy because a proposed process change will eliminate a manual step their team takes pride in doing well. Good stakeholder communication might mean a clear, well-timed email explaining the change and its rationale. Good stakeholder management means recognizing, likely through informal conversation rather than a status report, that this stakeholder feels their team's expertise is being dismissed, and proactively addressing that concern - perhaps by involving them in designing the new process, or explicitly acknowledging their team's contribution - before it hardens into resistance that surfaces later as a formal objection or a slow-walked sign-off.",
        "The practical takeaway: don't treat your communication plan as the whole job. It's the visible, structured layer. Underneath it, stay attentive to how each key stakeholder is actually feeling about the project, and be willing to have informal, off-the-record conversations that a status report will never capture.",
        "Here's a further way to internalize the distinction: stakeholder communication can be almost entirely planned in advance, because it's largely mechanical - who gets what information, how often. Stakeholder management can never be fully planned in advance, because it's fundamentally reactive and relational - it requires you to notice, in real time, how a specific person is responding to a specific piece of news, and to adjust your approach accordingly. This is why experienced BAs often describe stakeholder management as the 'soft skill' side of the job that takes the longest to develop, even though the mechanics of building a communication plan can be taught in a single course segment like this one."
      ]
    },
    {
      "img": "d3-6.jpg",
      "notes": [
        "Let's make this concrete by building a communication plan, which is simply a table that answers five questions for every stakeholder group: who, what, through what channel, how often, and who's responsible for sending it.",
        "Start with who - your stakeholder groups, ideally organized by the power/interest quadrant we just covered, since that quadrant strongly predicts appropriate frequency and depth. Next, what - the content each group actually needs. Your 'manage closely' sponsors typically need decision points, risks, and budget or timeline impacts. Your 'keep informed' end users typically need what's changing for them specifically, when, and how to get help or provide feedback - they usually don't need budget details or vendor negotiation status. Matching content to audience is where a lot of communication plans go wrong: sending sponsors too much operational noise buries the decisions they actually need to make, and sending end users information written for executives leaves them confused or disengaged.",
        "Next, channel. Some information belongs in a live conversation - anything sensitive, anything requiring negotiation, or anything you suspect will generate an emotional reaction. Some belongs in a written status report, useful for anything that needs a durable record or that multiple people need to reference later. Some belongs in a workshop or meeting, appropriate when you need real-time discussion and decisions rather than one-way updates. And increasingly, some belongs in a shared dashboard or collaboration tool, appropriate for stakeholders who want on-demand visibility without waiting for a scheduled update.",
        "Next, frequency. 'Manage closely' stakeholders often warrant weekly touchpoints, sometimes more during critical decision points. 'Keep satisfied' stakeholders might need only a monthly high-level summary. 'Keep informed' stakeholders often do well with updates tied to milestones rather than a strict calendar - 'you'll hear from us when there's something that affects you,' rather than a generic weekly email that trains people to stop reading it. 'Monitor' stakeholders may need nothing beyond access to a general project update if they choose to look.",
        "Finally, assign an owner for each communication - on larger projects, this might not always be the BA, but the BA is frequently the person who drafts the content, even when a project manager or sponsor delivers it. Write your communication plan down, even in a simple format, and revisit it at major milestones, because stakeholder needs and priorities shift as a project moves from initiation to delivery to go-live.",
        "One further refinement worth building into your communication plan: distinguish between routine, expected communication and news that needs a different treatment because it's unwelcome or unexpected. A routine weekly status update can travel through a standard written channel without much thought. But if a milestone is going to slip, a scope item is being cut, or a stakeholder's specific request isn't going to be accommodated, that news deserves a direct conversation first, ideally before it appears in any written report, so the stakeholder hears it from you personally rather than discovering it cold in a document alongside everyone else. This single habit - bad news gets a conversation first, good news can travel by email - prevents an enormous amount of stakeholder resentment that otherwise gets misattributed to the news itself rather than to how it was delivered."
      ]
    },
    {
      "img": "d3-7.jpg",
      "notes": [
        "Two situations come up on almost every project, and they deserve specific attention because they're where new BAs tend to freeze up: stakeholders whose priorities genuinely conflict with each other, and stakeholders who are resistant, disengaged, or simply hard to reach.",
        "When priorities conflict - say, the sales team wants a feature built quickly with minimal process, while compliance wants rigorous controls that will slow delivery - your job is not to personally decide who's right. Your job is to make the tradeoff visible and explicit, and escalate the decision to whoever has the authority to make it. Document both positions clearly and neutrally, quantify the tradeoff wherever you can - 'the compliance control adds approximately three weeks but reduces audit risk by X' - and bring that framed tradeoff to the appropriate decision-maker, usually the project sponsor or a steering committee, rather than letting it fester as an unresolved disagreement between two stakeholder groups who each believe they're being ignored. Neutrality is your credibility here: if either side senses you've taken sides, you lose the trust of the other, and trust is the currency you need for every future elicitation session with that stakeholder.",
        "When a stakeholder is resistant or disengaged - hard to schedule, non-responsive to emails, visibly unenthusiastic in meetings - resist the temptation to simply route around them. First, try to understand why. Resistance is often not about the project at all; it can be about workload, fear of job impact, past bad experiences with similar initiatives, or simply not understanding why the change is needed. A short, genuinely curious conversation - 'I've noticed you haven't had much bandwidth for this, is there a better way to get your input?' - often uncovers the real issue faster than escalating. Second, adjust your approach to fit their constraints: if someone is too busy for a sixty-minute workshop, ask for fifteen focused minutes on the two or three decisions that specifically need their input. Third, if genuine disengagement continues and their input is truly required, escalate through your sponsor rather than letting a project stall silently - a missing signature or unavailable decision-maker is a project risk, and risks should be raised, not absorbed quietly by the BA.",
        "The common thread in both situations: stay neutral, make problems visible rather than hiding them, and use your sponsor and governance structure for decisions that are genuinely above your authority to resolve alone. A BA who tries to personally referee every conflict or personally win over every resistant stakeholder will burn out and often make the situation worse.",
        "Let's add one more dimension to handling resistant stakeholders: distinguishing genuine resistance from simple overload. A stakeholder who says 'I don't have time for this' might be signaling deep skepticism about the initiative itself, or might simply be an overworked, well-intentioned person juggling five other priorities with no bandwidth left over. These two situations look identical from the outside but require very different responses - skepticism needs to be addressed through better understanding of their underlying concern, while overload needs to be addressed through respecting their time, offering flexible, shorter engagement options, and sometimes working through their manager to formally protect a small amount of dedicated time. Assuming every instance of resistance is skepticism, when it's actually overload, wastes effort trying to persuade someone who was never opposed in the first place - they were just out of hours in the day.",
        "One more practical tool worth having ready for conflicting priorities: a simple, one-page decision brief format you can reuse whenever you need to escalate a tradeoff. State the decision needed in one sentence, list the options with a short summary of each stakeholder position, note the impact of each option on cost, timeline, and risk as concretely as you can, and leave a clear space for the decision-maker's choice and the date. Having this format ready before you need it means that when a real conflict arises, you're not improvising a way to present it under pressure - you're simply filling in a template you've already used successfully before."
      ]
    },
    {
      "img": "d3-8.jpg",
      "notes": [
        "Let's recap. A stakeholder is anyone with an interest in, influence over, or impact from a change - a much wider circle than just the person who commissioned the project, and identifying that full circle, including easily overlooked groups like end users and support staff, prevents late-stage surprises. The power/interest grid gives you a repeatable way to prioritize engagement: manage closely, keep satisfied, keep informed, or monitor. Stakeholder management is the broader relational discipline; stakeholder communication is one of its tools, and a good communication plan specifies audience, content, channel, and frequency for each group. And when priorities conflict or stakeholders resist, your job is to stay neutral, make the tradeoffs visible, and escalate decisions that are genuinely above your authority, rather than absorbing every conflict personally.",
        "In the next course, we move from managing people to managing the documents those people rely on: Business Requirements Documents and Functional Requirements Documents. We'll cover what belongs in each, how they differ, and how to write them so they actually get used. See you there."
      ]
    }
  ],
  "quiz": [
    {
      "q": "According to the BABOK, a stakeholder is best defined as:",
      "options": [
        "Anyone who directly funds the project",
        "Any individual or group with an interest in, influence over, or impact from a change",
        "Only people listed on the project's org chart",
        "The person who requested the initiative"
      ],
      "correct": 1,
      "explanation": "This definition is deliberately broad and includes people who never asked for the change but are affected by it."
    },
    {
      "q": "In the power/interest grid, a stakeholder with high power but low interest belongs in which quadrant?",
      "options": [
        "Manage Closely",
        "Keep Satisfied",
        "Keep Informed",
        "Monitor"
      ],
      "correct": 1,
      "explanation": "High power, low interest stakeholders need periodic, high-level updates to keep them comfortable without overwhelming them."
    },
    {
      "q": "What is the primary difference between stakeholder management and stakeholder communication?",
      "options": [
        "They are identical practices with different names",
        "Communication is the broader, relational discipline; management is one tactical tool within it",
        "Management is the broader, relational discipline; communication is one tactical tool within it",
        "Communication only applies to external stakeholders"
      ],
      "correct": 2,
      "explanation": "Management is strategic and relational (trust, expectations, negotiation); communication is a tactical tool that executes that strategy."
    },
    {
      "q": "A communication plan should specify which four things for each stakeholder group?",
      "options": [
        "Budget, timeline, risk, and scope",
        "Audience, content, channel, and frequency",
        "Name, title, department, and email",
        "Meeting agenda, minutes, action items, and owner"
      ],
      "correct": 1,
      "explanation": "These four elements ensure the right information reaches the right people through the right channel at the right cadence."
    },
    {
      "q": "When two stakeholder groups have genuinely conflicting priorities, what is the BA's appropriate role?",
      "options": [
        "Personally decide which group is right",
        "Ignore the conflict and hope it resolves itself",
        "Make the tradeoff visible and explicit, then escalate to the appropriate decision-maker",
        "Side with whichever stakeholder has more organizational power"
      ],
      "correct": 2,
      "explanation": "Staying neutral and escalating decisions above your authority protects your credibility with both stakeholder groups."
    }
  ]
};
