var COURSE_DATA = {
  "title": "User Stories & Use Cases for Business Analysts",
  "slides": [
    {
      "img": "d5-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d5-2.jpg",
      "notes": [
        "Welcome to User Stories and Use Cases for Business Analysts. In course four we covered the heavier, document-based way of specifying what a system must do. This course covers two more targeted techniques, both centered on describing how an actual person interacts with a system to get something done - but they come from different traditions, look completely different on the page, and suit different kinds of projects.",
        "By the end of this hour, you'll be able to write a properly formatted user story using the 'as a, I want, so that' structure, and you'll know the INVEST criteria, a simple checklist for judging whether a story is actually ready to be worked on. You'll be able to write acceptance criteria in the Given, When, Then format, which is what turns a short story into something a team can actually test against. You'll be able to structure a full use case, including the main success scenario and, just as importantly, the alternate and exception flows that most new analysts forget. And you'll understand clearly when to reach for a lightweight user story versus a fully specified use case, because choosing the wrong tool for the situation is a common and avoidable mistake.",
        "Let's start with user stories, since you'll likely use them more often, especially in Agile environments.",
        "It's worth noting up front that the skills in this course are among the most frequently used, day to day, of anything in this entire program, precisely because so much of the industry now works in Agile. Even on projects that still produce formal BRDs and FRDs, you will very often find yourself also writing user stories to organize the actual sprint-by-sprint delivery work, which makes this course a practical companion to course four rather than a replacement for it."
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d5-3.jpg",
      "notes": [
        "Format: As a [role], I want [goal], so that [benefit]. Example: As a returning customer, I want to save my payment details, so that I don't have to re-enter them on every purchase. A user story is a short, plain-language statement describing a piece of functionality from the perspective of the person who wants it. The standard format is: as a [role], I want [goal or capability], so that [benefit or reason]. For example: 'As a returning customer, I want to save my payment details, so that I don't have to re-enter them on every purchase.' Notice all three parts do real work. The role tells the team who this is for, which matters because different roles often want different things from what looks like the same feature. The goal states specifically what capability is needed. And the so-that clause states the underlying benefit - and this last part is more important than new analysts usually realize, because it gives the delivery team enough context to make good judgment calls on details the story itself doesn't specify. If a developer understands the 'so that' is about reducing friction at checkout, they'll make smarter small decisions than if they only see the literal feature request in isolation.",
        "A user story is deliberately not a complete specification. Its purpose, in the Agile tradition it comes from, is to be a placeholder for a conversation - a prompt that the team, product owner, and stakeholders will discuss and refine together before and during the sprint, rather than a document meant to be complete and final the moment it's written. This is a real mindset shift from the FRD approach in course four, where the goal was maximal precision captured up front.",
        "So how do you know if a story is well-formed and ready to be worked on? Use the INVEST criteria, a widely used mnemonic. Independent means the story can be developed and delivered without being tightly coupled to another story - ideally, teams can pick it up in a different order without breaking things. Negotiable means the story isn't a rigid contract; the specific approach can still be discussed and adjusted before and during development. Valuable means the story delivers real value to a user or the business - a story that exists purely as a technical task with no clear beneficiary is usually better framed as a technical task, not a user story. Estimable means the team has enough understanding to roughly size the effort involved; if a story is too vague to estimate, it needs more clarification first. Small means the story is sized to be completed within a single sprint, ideally within a few days, not weeks. And Testable means there's a clear way to verify the story is done, which brings us directly to acceptance criteria.",
        "A story that fails several of these checks - too big, too vague to estimate, or with no clear way to verify it's done - isn't ready for a team to commit to. Part of the BA's job in backlog refinement, which we'll cover in course eight, is running new stories through this checklist before they're pulled into a sprint.",
        "Let's dig a little further into why the role in a user story matters so much. Consider two stories that might look almost identical at a glance: 'As a new customer, I want to save my payment details, so that checkout is faster next time' versus 'As a returning customer, I want to save my payment details, so that I don't have to dig out my card again.' A new customer likely doesn't yet have saved payment details to draw on and cares primarily about a smooth first experience; a returning customer already trusts the platform and cares about ongoing convenience. These subtly different roles can lead a thoughtful team toward different design decisions - perhaps a more reassuring security message for the new customer's first save, versus a frictionless one-click flow for the returning customer who's done this before. Naming the role precisely, rather than defaulting to a generic 'user,' is what unlocks this kind of nuance.",
        "Let's also spend a moment on a common failure mode: stories written entirely from a technical or system perspective rather than a genuine user perspective, sometimes called 'developer stories' dressed up in story format - 'As a developer, I want to refactor the payment module, so that the code is cleaner.' This may be legitimate technical work, but it isn't a user story in the sense this format is meant for, because there's no end-user value being described, which makes it very difficult to evaluate using the INVEST criteria, particularly Valuable. Legitimate technical work like this is often better tracked as a distinct technical task or a 'chore,' with its own justification tied back to how it enables future user value, rather than forced into a template built for user-facing value.",
        "One more nuance worth adding on sizing: teams new to estimating often confuse story size with story complexity. A story can be small in scope but technically tricky, or large in scope but mechanically simple and repetitive. INVEST's 'Small' criterion cares about whether the story fits comfortably within a sprint, not about how intellectually difficult it is, and a team's estimation conversation during refinement, which we'll cover in course eight, is precisely where size and complexity get untangled and reconciled into a single practical estimate."
      ]
    },
    {
      "img": "d5-4.jpg",
      "notes": [
        "A user story without acceptance criteria is an invitation to build the wrong thing, because 'save my payment details' can be interpreted many different ways. Acceptance criteria close that gap by specifying the exact conditions under which the story is considered complete and correct.",
        "The most common format is Given, When, Then, borrowed from behavior-driven development. Given describes the starting context or precondition. When describes the action the user takes. Then describes the expected outcome. For our payment details story, one scenario might read: Given a returning customer is at checkout with saved payment details on file, When they select the saved card and confirm the order, Then the order is placed without requiring the card number to be re-entered. Notice this is specific enough that a tester can execute it step by step and get an unambiguous pass or fail result.",
        "A single story typically needs several Given/When/Then scenarios, not just one, because you need to cover the interesting variations, not only the ideal path. For the same story, additional scenarios might cover: what happens when the saved card has expired, what happens when the customer chooses to enter a new card instead of using the saved one, and what happens if the customer has no saved payment details yet. Good acceptance criteria deliberately surface these variations during refinement, before development starts, rather than leaving a developer to guess or a tester to discover them by accident later.",
        "A practical habit: when you're writing a story, ask yourself 'what would make me confident this is truly done?' and write down the answer as acceptance criteria before the story goes into a sprint. This single habit prevents an enormous amount of the back-and-forth that happens when a developer builds something, a product owner reviews it, and says 'that's not what I meant' - because what was meant was never made explicit in the first place.",
        "A practical technique for making sure you've covered enough scenarios: deliberately brainstorm the boundary and failure cases before you consider a story's acceptance criteria complete. For almost any story, ask what happens with an empty or missing value, what happens at the maximum allowed value, what happens if the action is attempted twice in a row, and what happens if the user lacks permission to perform this action at all. Not every story needs scenarios for every one of these categories, but running through this checklist as a mental habit reliably surfaces scenarios a first draft would otherwise miss, particularly around the edges of a feature rather than its comfortable middle.",
        "It's also worth involving the whole team in writing acceptance criteria rather than treating it as something the BA produces alone and hands over. A developer will often spot a technical edge case the BA wouldn't think to ask about, and a tester will often think of a scenario neither the BA nor the developer considered. Acceptance criteria written collaboratively during refinement, which we'll cover in course eight, tend to be more complete than acceptance criteria written in isolation and simply presented to the team as a finished artifact.",
        "It's also worth distinguishing acceptance criteria from full test scripts. Acceptance criteria describe the conditions of satisfaction at a business-readable level, understandable by a product owner or stakeholder without technical training, while a detailed test script, which a QA engineer might write afterward, gets into technical execution steps, specific test data, and environment setup. Keeping acceptance criteria at this more readable level is what allows a non-technical stakeholder to meaningfully review and agree to them during refinement, rather than requiring translation before anyone outside the delivery team can understand what 'done' means for a given story."
      ]
    },
    {
      "img": "d5-5.jpg",
      "notes": [
        "Now let's turn to use cases, a technique with a longer history than user stories and a very different level of formality. A use case describes, in detail, how one or more actors interact with a system to achieve a specific goal, including not just the happy path but the meaningful variations and failure points along the way.",
        "A complete use case typically includes several standard elements. The Use Case Name states the goal in a short verb phrase, like 'Process a Return' or 'Submit an Expense Report.' The Actor or Actors identify who initiates the interaction - this might be a human role, like 'Customer Service Agent,' or another system entirely, since use cases work equally well for system-to-system interactions. Preconditions state what must be true before this use case can begin - for example, 'the customer service agent is logged in and viewing the customer's account.' The Main Success Scenario is the heart of the use case: a numbered sequence of steps describing the ideal path from start to goal achievement, written as an exchange between actor and system - the actor does something, the system responds, and so on, until the goal is reached.",
        "This is where use cases really distinguish themselves from user stories: Alternate Flows and Exception Flows. An alternate flow describes a valid variation on the main path that still leads to a successful outcome - for instance, in a return process, the main flow might assume the item is in resellable condition, while an alternate flow covers what happens when the item is damaged and needs to be routed to a different disposition. An exception flow describes what happens when something goes wrong - the payment fails, the system times out, the item was never actually purchased from this retailer. New analysts frequently write a beautiful main success scenario and stop there, but in real systems, exception handling is often where the majority of genuine complexity and risk lives. A support team dealing with an unhappy customer rarely calls about the happy path; they call because something in an alternate or exception flow wasn't handled the way they expected. Finally, Postconditions state what's true once the use case completes successfully - for example, 'the return is logged in the system and a refund has been initiated.'",
        "Let's walk through a condensed example. Use case: Process a Product Return. Actor: Customer Service Agent. Precondition: agent is viewing a valid, eligible order. Main success scenario: one, agent selects the item to be returned; two, system displays the return reason options; three, agent selects a reason and confirms the item's condition; four, system calculates the refund amount and generates a return label; five, system logs the return and initiates the refund. Alternate flow, item damaged in transit: at step three, if the agent indicates the item arrived damaged, the system instead routes the case to the damage claims queue rather than calculating a standard refund. Exception flow, order not eligible for return: if, before step one, the system determines the order is outside the return window, the use case ends immediately with an on-screen message to the agent, and no return is initiated. Notice how much more the exception and alternate flows reveal about the true complexity of this feature than the main flow alone ever would.",
        "Use cases shine on projects with complex, rule-heavy interactions, multiple actor types, or significant regulatory and audit requirements, because their formal structure forces you to enumerate the paths that matter most for risk and compliance. They take considerably longer to write than a user story, which is exactly why they aren't the default choice on fast-moving Agile teams.",
        "Let's spend a moment on actor identification specifically, since it's easy to under-specify. A single use case can have a primary actor, the one whose goal drives the interaction, and one or more secondary actors, who participate but aren't the one whose goal is being satisfied. In our return processing example, the Customer Service Agent is the primary actor, but a Warehouse System that receives the returned item might be a secondary actor, participating in the flow without being the one whose goal the use case exists to satisfy. Naming secondary actors explicitly, not just the primary one, often surfaces integration and data-flow requirements that would otherwise stay implicit until much later in a project.",
        "A brief word on the right level of granularity for a use case, since new analysts sometimes write one either far too broad or far too narrow. 'Manage Customer Account' is usually too broad - it likely bundles together several genuinely distinct goals, like updating contact information, changing a password, and closing an account, each of which deserves its own use case with its own main flow and exceptions. 'Click the Save Button' is usually too narrow - that's an interface-level action, not a meaningful goal in its own right. A well-scoped use case typically represents a goal a real person would describe in a single sentence without mentioning a specific button or screen, like 'Update Contact Information' or 'Process a Return.'"
      ]
    },
    {
      "img": "d5-6.jpg",
      "notes": [
        "With both techniques on the table, how do you decide which to use? Start with the delivery approach. If the team works in short Agile sprints and values continuous conversation over exhaustive up-front documentation, user stories with strong acceptance criteria are usually the better fit - they're fast to write, easy to reprioritize in a backlog, and designed to be elaborated through conversation rather than finalized on paper before work begins. If the project involves complex business rules, multiple interacting actors, significant regulatory or compliance exposure, or a genuine need for a detailed audit trail of exactly how a process is meant to behave under every condition, use cases are usually worth the additional time investment, because their structure is built precisely to expose and document that kind of complexity.",
        "It's also worth knowing that many real projects use both, at different altitudes. A complex process might be documented as one detailed use case at the epic or feature level to capture the full rule set and exception handling once, and then broken down into several smaller user stories for the actual sprint-by-sprint delivery work, each story referencing back to the relevant section of the use case for the detail a developer needs. This hybrid approach gets you the rigor of a use case for genuinely complex logic, without forcing every single piece of functionality on the project through that same heavy format.",
        "A second consideration is your audience and your organization's existing habits. If your delivery team and product owners are fluent in Agile ceremonies, which we'll cover in courses seven and eight, user stories will fit naturally into their existing rhythm of backlog refinement and sprint planning. If you're working with a delivery team or vendor that expects formal specifications - common in government contracting, healthcare, and other heavily regulated industries - a use case, or even a full FRD built around several use cases, may be the expected and required format regardless of your own preference.",
        "The practical rule of thumb: reach for a user story by default when speed and iterative conversation are more valuable than exhaustive precision, and reach for a use case when the cost of missing an exception path or an edge case is high enough to justify the extra time it takes to write one properly.",
        "One more practical consideration worth naming: team maturity with each format. A team that has never worked with use cases will need time and support to write them well, and a rushed, poorly written use case, missing key exception flows, can be worse than no use case at all, because it creates false confidence that the complexity has been captured when it hasn't. Similarly, a team new to Agile may initially write user stories that are really just BRD-style requirements with 'as a user' pasted awkwardly on the front, missing the spirit of a story as a prompt for conversation. Introducing either format well usually benefits from a short, dedicated coaching period - a few sessions specifically reviewing early drafts against the INVEST criteria or the use case template - before expecting the team to produce strong examples independently."
      ]
    },
    {
      "img": "d5-7.jpg",
      "notes": [
        "Let's bring this together. A user story follows the as a, I want, so that format and works best as a lightweight prompt for conversation rather than a complete specification. The INVEST criteria - independent, negotiable, valuable, estimable, small, testable - tell you whether a story is actually ready to be worked. Given, When, Then acceptance criteria turn a short story into something a team can build and test against precisely, and a single story usually needs several scenarios to cover meaningful variations. A use case goes further, formally documenting actors, preconditions, a main success scenario, and - critically - the alternate and exception flows that reveal where the real complexity of a process actually lives. And you now have a practical way to choose between the two: lightweight stories for fast-moving Agile work, formal use cases for complex, rule-heavy, or regulated processes, and often both together at different levels of a single project.",
        "In the next course, we shift from describing individual interactions to mapping entire processes: Process Mapping, BPMN, and UML. You'll learn to visually represent how work flows through an organization or a system, which is often the fastest way to expose a misunderstanding that words alone would never surface. See you there."
      ]
    }
  ],
  "quiz": [
    {
      "q": "What does the \"so that\" clause in a user story primarily provide?",
      "options": [
        "A legal disclaimer",
        "The underlying benefit or reason, giving the team context for good judgment calls",
        "The story's priority ranking",
        "The name of the Product Owner"
      ],
      "correct": 1,
      "explanation": "Understanding the benefit helps the team make smart decisions on details the story itself doesn't specify."
    },
    {
      "q": "In the INVEST criteria, what does the \"S\" stand for, and what does it mean?",
      "options": [
        "Specific \u2014 the story names an exact UI element",
        "Small \u2014 the story fits comfortably within one sprint",
        "Sequential \u2014 stories must be worked in strict order",
        "Scalable \u2014 the story applies to unlimited users"
      ],
      "correct": 1,
      "explanation": "A story too large to complete within a sprint isn't ready \u2014 it needs to be split."
    },
    {
      "q": "In Given/When/Then acceptance criteria, what does the \"When\" describe?",
      "options": [
        "The expected outcome",
        "The starting context or precondition",
        "The action the user takes",
        "The story's estimated size"
      ],
      "correct": 2,
      "explanation": "Given sets context, When is the action taken, Then is the expected outcome."
    },
    {
      "q": "What is the main advantage of a use case's alternate and exception flows over a user story?",
      "options": [
        "They make the document shorter",
        "They formally capture variations and failure paths, which is often where real process complexity lives",
        "They eliminate the need for acceptance criteria",
        "They are always written by developers, not BAs"
      ],
      "correct": 1,
      "explanation": "Support teams rarely call about the happy path \u2014 exception handling is where genuine complexity and risk usually live."
    },
    {
      "q": "When is a use case generally the better choice over a lightweight user story?",
      "options": [
        "When the team needs to move as fast as possible with minimal documentation",
        "When the process is simple with no real branching logic",
        "When the process is complex, rule-heavy, involves multiple actors, or carries regulatory/compliance risk",
        "Only when working with external customers"
      ],
      "correct": 2,
      "explanation": "The extra time a use case takes is worth it when missing an edge case or exception carries high cost."
    }
  ]
};
