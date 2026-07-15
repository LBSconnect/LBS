var COURSE_DATA = {
  "title": "Scrum Ceremonies, Backlog & Kanban",
  "slides": [
    {
      "img": "d8-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d8-2.jpg",
      "notes": [
        "Welcome to Scrum Ceremonies, Backlog, and Kanban. In the last course, we introduced the sprint cycle at a high level. Now we're going to open it up and look closely at the actual recurring meetings - the ceremonies - that make Scrum work in practice, with special attention to the two you as a BA will be most actively involved in: Backlog Refinement and Sprint Planning.",
        "By the end of this hour, you'll know the purpose, participants, and basic structure of all four core Scrum ceremonies - Sprint Planning, the Daily Scrum, the Sprint Review, and the Sprint Retrospective - plus the ongoing practice of Backlog Refinement that ties them together. You'll be able to run or meaningfully contribute to a Backlog Refinement session, including splitting oversized stories using the INVEST criteria from course seven. You'll know practical techniques for prioritizing a Product Backlog, including MoSCoW and value-versus-effort scoring. And you'll understand Kanban, a second major Agile framework built around visualizing work and limiting work in progress, plus when a team might reasonably choose it over Scrum.",
        "Let's start with Backlog Refinement, since it's arguably the ceremony where a BA's skills are most directly and continuously applied.",
        "One more framing note before we start: think of these ceremonies less as bureaucratic meetings to endure and more as the team's built-in feedback loops. Every ceremony we cover in this hour exists to catch a specific kind of problem early - refinement catches unclear stories, planning catches over-commitment, the daily check-in catches emerging blockers, the review catches misaligned expectations, and the retrospective catches team friction - and understanding the specific problem each one is designed to catch will make you a much stronger contributor in every one of them."
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d8-3.jpg",
      "notes": [
        "Backlog Refinement, sometimes called backlog grooming, isn't formally one of the events defined in the original Scrum framework the way Sprint Planning or the Daily Scrum are, but it's such a universal and necessary practice that virtually every real Scrum team runs it, typically once or twice per sprint. Its purpose is straightforward: make sure the items near the top of the Product Backlog - the ones likely to be worked on in the next sprint or two - are well understood, appropriately sized, and ready to be pulled into Sprint Planning without a lengthy discovery conversation happening in the room at that moment.",
        "A typical refinement session involves the Product Owner, the BA where that's a distinct role, and representatives from the Development Team, and it accomplishes several things. First, clarifying ambiguous stories - if a story near the top of the backlog raises questions the team can't answer, that's exactly the moment to apply the elicitation techniques from course two, whether that's a quick clarifying conversation with a stakeholder or pulling in a document for reference. Second, splitting oversized stories - recall the INVEST criteria from course seven; a story that's too large to complete within a sprint needs to be broken into smaller, still-valuable pieces. A common and effective way to split a large story is by workflow steps, by variations in data or business rules, or by separating the happy path from more complex edge cases, delivering the core value first and layering in the edge cases as follow-up stories.",
        "Third, adding acceptance criteria, using the Given, When, Then format from course five, to stories that don't yet have them clearly defined - a story shouldn't move forward to Sprint Planning without at least a rough sense of what 'done' looks like. Fourth, estimating effort, commonly using relative sizing techniques like story points rather than hours, since relative sizing tends to be faster and more consistent across a team than trying to predict exact hours for creative, variable work. And fifth, re-ordering the backlog as new information emerges - priorities shift as the team learns more, and refinement is a natural, low-friction point to make those adjustments rather than waiting for a larger, less frequent planning event.",
        "A practical tip for running refinement well: come prepared. As the BA, you should generally walk into a refinement session having already done some homework on upcoming backlog items - a quick stakeholder check, a review of relevant documentation - so the session is spent resolving genuine open questions with the team, rather than the team discovering for the first time, in the meeting, that a story is missing basic information. Teams that refine well tend to have smooth, low-drama Sprint Planning sessions; teams that skip or rush refinement tend to have long, frustrating planning sessions where half the time is spent clarifying stories that should have already been ready.",
        "Let's add a practical estimating technique many teams use during refinement: Planning Poker. Each team member privately selects a card representing their estimate, often using a Fibonacci-like sequence such as one, two, three, five, eight, and thirteen, and everyone reveals their choice simultaneously. When estimates differ significantly, the people with the highest and lowest numbers explain their reasoning before a brief re-vote. This structure deliberately prevents anchoring, where the first person to speak unintentionally influences everyone else's number, and it often surfaces a hidden complexity or a hidden simplification that only one team member had noticed, which is frequently more valuable than the estimate number itself.",
        "A word on how much refinement is enough: a widely used guideline suggests spending roughly 5 to 10 percent of the team's total sprint capacity on refinement activities, though this is a starting rule of thumb to adjust based on experience, not a strict law. Too little refinement time leads to under-prepared Sprint Planning sessions full of surprises; too much can start to feel like the team is perpetually planning rather than delivering. Track how smoothly your Sprint Planning sessions go as a rough signal - if planning consistently runs long and surfaces major open questions, that's usually evidence refinement needs more attention, not that planning itself is the problem.",
        "One more refinement habit worth building: keep a short, visible list of open questions or dependencies for each upcoming story, rather than letting them live only in your head or scattered across old meeting notes. A simple running list - what's blocking this story from being fully ready, and who owns resolving it - makes refinement sessions faster, because the team can quickly check status on known open items rather than rediscovering them from scratch in every session."
      ]
    },
    {
      "img": "d8-4.jpg",
      "notes": [
        "Sprint Planning is a formally defined Scrum event that kicks off every sprint, typically time-boxed to around two hours for each week of sprint length - so roughly four hours for a two-week sprint. It has two main parts. First, the team, with the Product Owner, agrees on a Sprint Goal - a single, concise statement of what the sprint is meant to achieve, giving the sprint's work a unifying purpose beyond just a checklist of disconnected items. Second, the Development Team selects items from the top of the refined Product Backlog that they believe they can complete in service of that goal, and begins breaking them down into the specific tasks needed to deliver them.",
        "As a BA, your main contribution to Sprint Planning happens mostly before the meeting, through the refinement work we just covered - a well-refined backlog makes planning fast and confident. During the meeting itself, you're often the person best positioned to answer clarifying questions about a story's intent or acceptance criteria in real time, and to flag if the team is about to commit to something that doesn't actually align well with the sprint goal or with a stakeholder priority you're aware of. If a story turns out to still be too large or too vague once the team starts breaking it into tasks, that's a live signal to split or clarify it on the spot, applying the same INVEST thinking from refinement.",
        "The Daily Scrum, often called stand-up, is a short, time-boxed check-in - fifteen minutes is the classic guideline - held every working day of the sprint, focused specifically on progress toward the sprint goal and on surfacing anything blocking the team. The classic structure, though teams adapt it, asks each person roughly: what did I do yesterday that helped the team meet the sprint goal, what will I do today, and are there any impediments in my way? The purpose is coordination and quick problem surfacing among the Development Team, not a status report for management, and it's meant to be brief and focused - detailed problem-solving discussions are meant to happen afterward, in a smaller group, rather than consuming the whole team's time during the stand-up itself. A BA typically attends, both to stay current on progress and to be immediately available if a question arises about a story's requirements or acceptance criteria mid-sprint.",
        "It's worth naming a subtle failure mode in Sprint Planning worth watching for: a team that agrees to a Sprint Goal so vague it could accommodate almost any combination of backlog items, which defeats the purpose of having a goal at all. A strong Sprint Goal is specific enough that the team could, in principle, fail to meet it - 'improve the platform' is not a real goal, while 'enable customers to complete a return without contacting support' is specific enough to genuinely focus the sprint's work and specific enough that everyone will know, honestly, whether it was achieved by the Sprint Review."
      ]
    },
    {
      "img": "d8-5.jpg",
      "notes": [
        "The Sprint Review happens at the end of the sprint and is where the Development Team demonstrates the completed increment to the Product Owner and other stakeholders, gathering feedback that directly feeds back into the Product Backlog. This is one of the most important moments for a BA, because it's a formally built-in stakeholder validation checkpoint - directly connected to the validation discipline from course two - happening every sprint rather than once at the very end of a long project. Preparing stakeholders for what they'll see, gathering their reactions systematically rather than letting feedback get lost in casual hallway comments, and translating that feedback into new or adjusted backlog items afterward is often a core part of the BA's role around this ceremony.",
        "The Sprint Retrospective follows the review and is a private, internal team session focused on how the team worked together during the sprint - not what was built, but how the team functions - looking at what went well, what didn't, and what the team commits to trying differently next sprint. As a team member, a BA participates fully and honestly here, and it's worth noting that retrospectives work best in a psychologically safe environment where people can raise real problems without fear of blame - a Scrum Master typically facilitates this, but everyone in the room shares responsibility for keeping it constructive.",
        "Now, a practical question that comes up constantly: how do you actually decide what order items belong in on the Product Backlog? Two techniques are especially common. MoSCoW prioritization sorts items into four categories: Must have, Should have, Could have, and Won't have this time - a simple, fast way to align a group of stakeholders on relative priority, particularly useful early in a project or release when you're trying to agree on overall scope. Value-versus-effort scoring plots items on a simple grid, one axis for business value, one axis for the effort or complexity required to deliver it, and naturally surfaces the 'quick wins' - high value, low effort - that often deserve to be pulled toward the top of the backlog, while flagging low-value, high-effort items as strong candidates for the bottom of the list, or removal entirely. Neither technique replaces the Product Owner's judgment, but both give stakeholders and the team a shared, structured language for a conversation that would otherwise be driven purely by whoever argues most persuasively in the room.",
        "Let's add a practical tip for running a Sprint Review that actually generates useful feedback rather than polite silence: ask specific questions rather than a generic 'any thoughts?' at the end of a demo. 'Does this match what you pictured when we discussed this story two weeks ago?' or 'What would you want to see different before this goes to all your users?' invites a concrete, actionable answer, while a generic prompt often produces a generic 'looks good,' even from a stakeholder who privately has real concerns they haven't yet found the moment to voice.",
        "A further prioritization technique worth knowing alongside MoSCoW and value-versus-effort scoring is the Kano model, which sorts features into categories based on how they affect customer satisfaction: basic expectations that cause dissatisfaction if missing but don't especially delight anyone when present, performance features where more is generally better and satisfaction scales with how well they're delivered, and delighter features that aren't expected but create outsized positive reaction when included. A backlog conversation that explicitly separates 'this is a basic expectation we simply cannot ship without' from 'this would be a nice delighter but isn't required' tends to produce sharper, less contentious prioritization discussions than treating every feature as equally important until someone argues loudly enough."
      ]
    },
    {
      "img": "d8-6.jpg",
      "notes": [
        "Continuous flow, no fixed sprints. The WIP limit is the single most important practice \u2014 it forces the team to finish existing work rather than starting new work. Scrum isn't the only Agile framework in wide use, and Kanban is common enough, especially on support, maintenance, and operations-heavy teams, that every BA should understand its core mechanics and how they differ from Scrum's rhythm.",
        "Kanban's foundation is visualizing work, typically through a board with columns representing the stages work passes through - a simple version might be To Do, In Progress, Review, and Done, though real boards are often more detailed. Each piece of work is represented as a card, and it moves left to right across the board as it progresses, giving anyone who looks at the board an immediate, honest picture of exactly what's happening and where things are stuck.",
        "The single most important practice in Kanban, and the one that most distinguishes it from a simple to-do list turned into columns, is the Work in Progress limit, usually shortened to WIP limit. Each column, especially 'In Progress,' has an explicit maximum number of cards allowed in it at once. If the In Progress column has a WIP limit of three and it's already full, the team is not allowed to start a fourth item - even if someone finishes their current task early - until something moves out of that column first. This feels counterintuitive to newcomers, who instinctively want to start new work whenever anyone has capacity, but the WIP limit is what actually improves flow: it forces the team to finish and unblock existing work rather than starting an ever-growing pile of half-finished items, and it makes bottlenecks immediately visible, because work will visibly pile up against a full column, showing everyone exactly where the constraint is.",
        "Unlike Scrum, Kanban doesn't use fixed-length sprints - work flows continuously, and items are pulled into the board and completed one at a time, whenever there's WIP capacity, rather than being batched into a two-week commitment. This makes Kanban a particularly good fit for teams handling a steady stream of unpredictable, variably-sized work - a support or maintenance team fielding an unplanned mix of bug fixes and small enhancement requests, for instance, where planning two full weeks of work in advance doesn't reflect how the work actually arrives.",
        "Kanban still values many of the same underlying Agile principles as Scrum - continuous stakeholder collaboration, responding to change, delivering value incrementally - but it achieves them through continuous flow and WIP limits rather than through the fixed cadence of sprints, ceremonies, and dedicated roles that Scrum prescribes. A BA working on a Kanban team still elicits, refines, and writes clear backlog items exactly as covered in this program - the core discipline doesn't change - but there's no Sprint Planning to prepare for, and refinement happens continuously rather than in a scheduled recurring session.",
        "Let's add one more practical Kanban concept worth knowing: cycle time, the amount of time an item spends on the board from when work actually starts on it to when it's completed. Unlike Scrum's sprint-based velocity, which measures work completed per fixed time period, cycle time measures how long any individual piece of work takes to flow through the system, and tracking it over time is one of the best ways a Kanban team identifies where bottlenecks are forming, often well before those bottlenecks become obvious just from looking at the board on any single day.",
        "It's also worth understanding how Kanban handles prioritization, since without sprint planning, there's no obvious recurring moment to re-rank the backlog. Most Kanban teams instead maintain a continuously prioritized queue feeding the board, reviewed and reordered on an ongoing basis, often in a lightweight recurring meeting focused purely on what should be pulled next, rather than committing to a fixed batch of work for a fixed time period the way Scrum does. This continuous reprioritization is one of Kanban's genuine strengths for unpredictable work, since a newly arrived urgent item can be slotted in as the next thing pulled, rather than waiting for the next sprint boundary to be considered at all."
      ]
    },
    {
      "img": "d8-7.jpg",
      "notes": [
        "So when might a team reasonably choose one over the other? Scrum tends to fit well when work can be meaningfully batched into a two-to-four-week cycle, when a clear Sprint Goal adds real value in focusing the team, and when the discipline of fixed roles and ceremonies helps a team that's newer to Agile build strong habits. Kanban tends to fit well when work arrives unpredictably and needs to be picked up quickly rather than waiting for the next sprint, when priorities shift frequently enough that a two-week commitment feels artificial, or on teams - like many support and operations functions - where the nature of the work itself doesn't naturally break into sprint-sized chunks. It's also worth knowing that many organizations run a hybrid sometimes called Scrumban, borrowing Kanban's WIP limits and continuous flow while keeping some lightweight version of Scrum's planning and retrospective ceremonies - a reminder that these frameworks are tools to adapt, not rigid doctrines to follow perfectly.",
        "Let's recap the whole course. Backlog Refinement keeps the top of the Product Backlog clear, appropriately sized, and estimable, and it's where a BA's elicitation and story-writing skills are applied continuously. Sprint Planning turns a refined backlog into a committed Sprint Backlog organized around a shared Sprint Goal. The Daily Scrum keeps the team coordinated day to day. The Sprint Review is a built-in, recurring stakeholder validation checkpoint, and the Sprint Retrospective is where the team improves how it works together. MoSCoW and value-versus-effort scoring give you structured ways to help prioritize a backlog. And Kanban, built around visualizing work and enforcing WIP limits, offers a continuous-flow alternative to Scrum's sprint cadence, well suited to unpredictable, steady-stream work.",
        "In the next course, we step away from process and ceremony entirely and into two practical technical skills every modern BA benefits from: SQL basics and Power BI. Understanding how to query data directly and build a basic report or dashboard makes you dramatically more self-sufficient and credible when working with data-driven requirements. See you there."
      ]
    },
    {
      "img": "d8-8.jpg",
      "notes": [
        "So when might a team reasonably choose one over the other? Scrum tends to fit well when work can be meaningfully batched into a two-to-four-week cycle, when a clear Sprint Goal adds real value in focusing the team, and when the discipline of fixed roles and ceremonies helps a team that's newer to Agile build strong habits. Kanban tends to fit well when work arrives unpredictably and needs to be picked up quickly rather than waiting for the next sprint, when priorities shift frequently enough that a two-week commitment feels artificial, or on teams - like many support and operations functions - where the nature of the work itself doesn't naturally break into sprint-sized chunks. It's also worth knowing that many organizations run a hybrid sometimes called Scrumban, borrowing Kanban's WIP limits and continuous flow while keeping some lightweight version of Scrum's planning and retrospective ceremonies - a reminder that these frameworks are tools to adapt, not rigid doctrines to follow perfectly.",
        "Let's recap the whole course. Backlog Refinement keeps the top of the Product Backlog clear, appropriately sized, and estimable, and it's where a BA's elicitation and story-writing skills are applied continuously. Sprint Planning turns a refined backlog into a committed Sprint Backlog organized around a shared Sprint Goal. The Daily Scrum keeps the team coordinated day to day. The Sprint Review is a built-in, recurring stakeholder validation checkpoint, and the Sprint Retrospective is where the team improves how it works together. MoSCoW and value-versus-effort scoring give you structured ways to help prioritize a backlog. And Kanban, built around visualizing work and enforcing WIP limits, offers a continuous-flow alternative to Scrum's sprint cadence, well suited to unpredictable, steady-stream work.",
        "In the next course, we step away from process and ceremony entirely and into two practical technical skills every modern BA benefits from: SQL basics and Power BI. Understanding how to query data directly and build a basic report or dashboard makes you dramatically more self-sufficient and credible when working with data-driven requirements. See you there."
      ]
    }
  ],
  "quiz": [
    {
      "q": "What is the main purpose of Backlog Refinement?",
      "options": [
        "To demo finished work to stakeholders",
        "To make sure items near the top of the backlog are clear, appropriately sized, and estimable before Sprint Planning",
        "To replace the need for a Sprint Retrospective",
        "To assign story points to the Product Owner"
      ],
      "correct": 1,
      "explanation": "Well-refined backlogs lead to smooth Sprint Planning; skipped refinement leads to long, surprise-filled planning sessions."
    },
    {
      "q": "What is the difference between a Sprint Review and a Sprint Retrospective?",
      "options": [
        "They are the same meeting held twice",
        "Review inspects the product with stakeholders; Retrospective inspects the team's process privately",
        "Retrospective is for stakeholders; Review is internal-only",
        "Review happens daily; Retrospective happens once per quarter"
      ],
      "correct": 1,
      "explanation": "Review is a built-in stakeholder validation checkpoint; Retrospective is a private team session on how they worked together."
    },
    {
      "q": "What is the single most important practice in Kanban that distinguishes it from a simple to-do list with columns?",
      "options": [
        "Daily stand-up meetings",
        "Work In Progress (WIP) limits on columns",
        "Fixed two-week sprints",
        "A dedicated Product Owner role"
      ],
      "correct": 1,
      "explanation": "WIP limits force the team to finish existing work before starting new work, making bottlenecks visible."
    },
    {
      "q": "Which prioritization technique sorts backlog items into Must have, Should have, Could have, and Won't have?",
      "options": [
        "Planning Poker",
        "MoSCoW",
        "Value-versus-effort scoring",
        "The Kano model"
      ],
      "correct": 1,
      "explanation": "MoSCoW is a fast way to align stakeholders on relative priority, especially early in a project."
    },
    {
      "q": "Which type of work is generally the best fit for Kanban rather than Scrum?",
      "options": [
        "Work that batches cleanly into 2-4 week increments",
        "Unpredictable, steady-stream work like support tickets and small enhancements",
        "Work requiring a fixed Sprint Goal",
        "Work with no urgency at all"
      ],
      "correct": 1,
      "explanation": "Kanban's continuous flow and WIP limits suit unpredictable work better than Scrum's fixed-length sprint commitments."
    }
  ]
};
