var COURSE_DATA = {
  "title": "SQL Basics & Power BI for Business Analysts",
  "slides": [
    {
      "img": "d9-1.jpg",
      "notes": [
        "(Title / transition slide \u2014 no narration.)"
      ]
    },
    {
      "img": "d9-2.jpg",
      "notes": [
        "Welcome to SQL Basics and Power BI for Business Analysts. Every course so far in this program has focused on requirements, process, and Agile delivery. This course is a bit different - it's a practical, hands-on introduction to two technical skills that, while not universally required for every BA role, have become increasingly expected, especially on data-heavy projects, and dramatically increase how self-sufficient and credible you are in conversations involving data.",
        "By the end of this hour, you'll understand why these two skills matter enough to invest in learning, even as a non-technical BA. You'll know the core concepts behind relational databases - tables, rows, columns, and the keys that connect tables together. You'll be able to read and write basic SQL queries using SELECT, WHERE, ORDER BY, JOIN, and GROUP BY, which together cover the large majority of what a BA actually needs day to day. You'll understand Power BI's core workflow, from getting data in, to shaping it, to building an actual report. You'll know how to construct a simple report with visualizations and interactive filters called slicers. And you'll pick up good practices for validating your data and avoiding metrics that look impressive but are actually misleading.",
        "This is a dense, practical hour - consider having a notepad handy to jot down the SQL syntax as we go. Let's start with why this matters."
      ],
      "badge": "Learning Objectives"
    },
    {
      "img": "d9-3.jpg",
      "notes": [
        "Here's the practical case for learning this material. A huge amount of BA work involves questions about data - how many customers did X, what percentage of transactions have Y, how has this metric changed over time. Without any SQL or reporting skill, a BA is entirely dependent on someone else - a data analyst, a developer - to answer even simple data questions, which slows everything down and means you can't independently sanity-check an answer you're given. With even basic SQL and Power BI literacy, you can explore data yourself, validate what stakeholders tell you against what the data actually shows, and build the reports that often accompany requirements and business cases. This doesn't replace dedicated data analysts on complex work, but it makes you dramatically faster and more credible on the questions that come up constantly in ordinary BA work.",
        "Let's build the conceptual foundation before touching syntax. A relational database organizes data into tables, and each table represents one type of entity - a Customers table, an Orders table, a Products table. Within a table, each row represents one specific instance of that entity - one particular customer, one particular order - and each column represents one attribute of that entity - a customer's name, email, or signup date. This is conceptually identical to a well-organized spreadsheet, and if you're comfortable with spreadsheets, you already have real intuition for how a table works.",
        "The power of a relational database comes from how tables connect to each other. Each table typically has a primary key, a column, or occasionally a combination of columns, that uniquely identifies each row - a CustomerID that's different for every customer, for instance. Other tables reference that primary key through a foreign key - the Orders table might have a CustomerID column too, and that column is a foreign key pointing back to the specific customer in the Customers table who placed each order. This relationship is what lets you ask questions that span multiple tables - 'show me all orders placed by customers who signed up in the last thirty days' - by connecting the Orders table to the Customers table through that shared CustomerID. This connecting operation is called a join, and it's one of the most important concepts we'll cover in the SQL segment coming up.",
        "Let's extend the relational model a bit further with a third common table in our running example: Products. An Orders table often doesn't store full product details directly; instead, a related OrderItems table typically links Orders to Products, recording which products were included in each order and in what quantity, with ProductID acting as a foreign key pointing to the Products table, and OrderID acting as a foreign key pointing back to Orders. This pattern - breaking data into focused tables connected by keys rather than one giant table trying to hold everything - is called normalization, and it's the standard design approach behind most well-built relational databases, precisely because it avoids repeating the same product name and price on every single order line and keeps each type of information stored in exactly one authoritative place."
      ]
    },
    {
      "img": "d9-4.jpg",
      "notes": [
        "Let's write some actual SQL, building up one clause at a time using a simple Orders table as our running example, with columns for OrderID, CustomerID, OrderDate, and OrderTotal.",
        "The most basic query starts with SELECT, which specifies which columns you want to see, and FROM, which specifies which table. Select order id, order date, order total, from Orders, returns every row in the Orders table but only those three columns. If you want every column without listing them individually, you can use an asterisk as shorthand: select asterisk from Orders.",
        "Next, WHERE lets you filter which rows are returned, based on a condition. Select order id, order total, from Orders, where order total is greater than one hundred, returns only orders over that amount. You can combine conditions with AND and OR - where order total is greater than one hundred and order date is greater than or equal to a specific date - to filter on multiple criteria at once, exactly the way you'd combine filters on a spreadsheet.",
        "Next, ORDER BY controls the sequence in which results are returned - by default ascending, from smallest or earliest to largest or latest, or descending if you add the keyword DESC. Select order id, order total, from Orders, where order total is greater than one hundred, order by order total descending, gives you the biggest qualifying orders first - a natural way to spot outliers or top performers.",
        "Now let's connect two tables using a JOIN, which is where the relational structure we just discussed becomes practically useful. Suppose we want each order shown alongside the customer's name, which lives in a separate Customers table, not in Orders. We join the two tables on the shared CustomerID column: select Customers dot customer name, Orders dot order total, from Orders, inner join Customers on Orders dot customer id equals Customers dot customer id. This tells the database: for every row in Orders, find the matching row in Customers where the customer ID values line up, and combine them into one result row. An inner join, the most common type, only returns rows where a match exists in both tables; you'll also encounter left joins, which return every row from the first table even when there's no match in the second, useful when you specifically want to see gaps - for instance, customers with no orders at all.",
        "Finally, GROUP BY lets you aggregate data - summarizing many rows into one row per group, typically combined with an aggregate function like COUNT, SUM, or AVERAGE. Select customer id, sum of order total, from Orders, group by customer id, returns one row per customer, showing their total spend across all their orders. Add order by sum of order total descending, and you instantly have your top customers by total spend - a query pattern you will use constantly in real BA work, whether you're investigating a business question yourself or validating a number that's been reported to you by someone else.",
        "Let's add one more clause that comes up constantly once you're comfortable with GROUP BY: HAVING. Where WHERE filters individual rows before any grouping happens, HAVING filters groups after aggregation - for instance, select customer id, sum of order total, from Orders, group by customer id, having sum of order total is greater than one thousand, returns only those customers whose total spend across all orders exceeds one thousand, a filter that wouldn't make sense to express with WHERE, since the total itself doesn't exist until after grouping has occurred. Keeping the distinction straight - WHERE filters rows, HAVING filters groups - resolves a surprisingly common point of confusion for people newer to SQL.",
        "A brief, practical note on formatting your own queries as you're learning: write each clause on its own line - SELECT, FROM, WHERE, GROUP BY, ORDER BY each starting a new line - even though SQL doesn't require this structurally. A query written this way is dramatically easier to read back later, easier to debug when something isn't returning what you expect, and easier for a colleague to review, and building this habit early will serve you well long after you've moved past these basic examples into more complex, multi-table queries."
      ]
    },
    {
      "img": "d9-5.jpg",
      "notes": [
        "Now let's move from querying data to actually building a report with it, using Microsoft Power BI, one of the most widely used business intelligence tools in the industry. Power BI's workflow breaks cleanly into four stages, and understanding this pipeline is more valuable than memorizing every button, because the same four stages apply whether you're building a simple one-page report or a large, complex model.",
        "The first stage is Get Data. Power BI connects to a wide range of sources - Excel files, SQL databases like the ones we just queried, SharePoint lists, cloud services, and many more. For a BA, this often means connecting either to an extract someone else has prepared, or directly to a database using the SQL skills from the previous segment, which lets you pull exactly the data you need rather than depending entirely on someone else's extract.",
        "The second stage is Power Query, Power BI's data transformation layer. Real-world data is rarely ready to use immediately - column names are inconsistent, dates are stored as text, unnecessary columns clutter the view, or data from two sources needs to be combined. Power Query lets you clean and reshape data through a visual, step-by-step interface - removing columns, renaming them, changing data types, filtering rows, and merging data from multiple sources - without writing code, and importantly, every step you take is recorded and can be reviewed or adjusted later, which matters enormously for transparency: anyone can look at your Power Query steps and see exactly how raw data became your finished report.",
        "The third stage is the Data Model, where you define relationships between different tables you've imported - conceptually identical to the primary key and foreign key relationships from the SQL segment. If you've imported both an Orders table and a Customers table, the Data Model is where you tell Power BI that Orders dot CustomerID relates to Customers dot CustomerID, so that visuals built from both tables combine correctly, the same underlying logic as the SQL join we just covered, but configured once, visually, rather than written into every individual query.",
        "The fourth and final stage is the Report canvas, where you actually build visualizations - bar charts, line charts, tables, cards showing a single key number - by dragging fields from your data model onto the canvas. This is the stage most people think of as 'Power BI,' but it only works well because of the data preparation and modeling that happened in the earlier stages - a beautiful chart built on poorly cleaned or incorrectly related data will confidently show the wrong answer.",
        "It's worth understanding the difference between Import mode and DirectQuery mode when connecting Power BI to a data source, since it affects both performance and freshness. Import mode copies the data into Power BI's own internal storage, which makes the report very fast to interact with but means the data only reflects the moment it was last refreshed. DirectQuery mode instead sends queries live to the underlying database each time a visual needs to display data, which keeps the report perfectly current but can be slower, especially against a large or heavily used source system. For most BA-built reports, particularly earlier in your learning, Import mode is the more forgiving choice, and understanding when a report was last refreshed, which we'll return to shortly, becomes especially important when working in this mode."
      ]
    },
    {
      "img": "d9-6.jpg",
      "notes": [
        "Let's walk through building a genuinely simple, useful report, because the biggest mistake new report builders make is trying to show too much on one page. A good first report answers a small number of clear business questions, not everything the data could possibly show.",
        "Start by choosing your visualizations to match the question you're answering, not the other way around. A bar chart is well suited to comparing a metric across categories - sales by region, ticket volume by support category. A line chart is well suited to showing a trend over time - revenue by month across the past year. A card visual, showing a single large number, is well suited to a key headline metric you want visible at a glance, like total revenue for the selected period. A table or matrix is well suited when the underlying detail itself is the point, not a visual comparison - a list of top ten customers by spend, for example. Resist the temptation to use a pie chart for more than a handful of categories, since people are genuinely bad at comparing the size of pie slices once you get much past three or four segments - a simple bar chart usually communicates the same comparison more clearly.",
        "Once you have a few visuals on the canvas, add a slicer - an interactive filter control that lets whoever is viewing the report narrow down what they're looking at, without needing to edit the report itself. A date range slicer lets a viewer focus on a specific month or quarter; a category slicer lets them isolate one region or product line. This interactivity is one of Power BI's biggest advantages over a static chart in a slide deck - a single well-built report can serve many different stakeholders asking slightly different questions of the same underlying data, because they can filter it themselves rather than requesting a new version from you every time their question shifts slightly.",
        "A brief note on DAX, Power BI's formula language, since you'll encounter the term: DAX, which stands for Data Analysis Expressions, is used to create calculated columns and measures - for instance, a measure that calculates year-over-year growth percentage, which isn't a raw column in your source data but a calculation derived from it. As a BA just starting out, you don't need to master DAX to be useful with Power BI; many valuable reports can be built using only the fields already present in your data model, combined with the aggregate functions - sum, average, count - built directly into the visualizations. Treat DAX as a skill to grow into once you're comfortable with the Get Data, Power Query, Data Model, and Report canvas workflow we just covered.",
        "Let's add a word on report layout and visual hierarchy, since even well-chosen individual visuals can produce a confusing report if poorly arranged. Place your most important, headline metric - often a card visual - in the top-left corner, since that's where most viewers' eyes naturally land first, reading a page roughly the way they'd read a page of text. Group related visuals together, and use consistent colors for the same category across every visual on the page, so that if a specific region or product line is shown in blue on one chart, it's shown in the same blue everywhere else on that page - inconsistent color use across visuals is a small detail that quietly undermines a viewer's ability to follow a report at a glance."
      ]
    },
    {
      "img": "d9-7.jpg",
      "notes": [
        "A report is only as trustworthy as the practices behind it, and a few habits separate a report people actually rely on from one that quietly misleads its audience.",
        "Always validate your numbers against a known source before sharing a report. If your report shows total revenue for last month, check that figure against a source you or someone else already trusts - an existing finance report, a previous manual calculation - before presenting it as fact. This is the same validation discipline from course two, applied to data instead of stakeholder statements: confirm, don't assume, especially with a number that's about to inform a business decision.",
        "Be deliberate and transparent about your date ranges and filters. A chart that doesn't clearly state what time period or filter it reflects can be technically accurate and still profoundly misleading, because the viewer will naturally assume it represents the full, unfiltered picture unless told otherwise. Label your date ranges and filters directly on the report, not just in a footnote easy to miss.",
        "Watch your chart scales. A bar chart with a y-axis that doesn't start at zero can visually exaggerate small differences into what looks like a dramatic change - a classic and surprisingly common way that an honest data set produces a misleading chart. Starting axes at zero, particularly for bar charts where length is what viewers instinctively compare, is a simple habit that keeps your visuals honest.",
        "Avoid vanity metrics - numbers that look impressive but don't actually inform a decision. Total lifetime signups is often a vanity metric if what actually matters to the business question at hand is active users this month; a report should be built around the metrics that answer the specific business question driving it, echoing the business requirements and success metrics from course four, not simply whatever numbers happen to be easiest to pull from the data.",
        "And finally, always make your data's freshness visible. Include the date the underlying data was last refreshed somewhere on the report. A stakeholder making a decision based on a report needs to know whether they're looking at this morning's numbers or numbers from three weeks ago, and a report without a visible refresh date invites exactly the kind of confident-but-wrong decision this entire program has been about preventing.",
        "One more validation habit worth building: whenever a number surprises you, in either direction, treat that surprise as a signal to double-check your query or report logic before sharing it further, rather than a signal to celebrate an unexpectedly good result or panic over an unexpectedly bad one. A sudden, dramatic shift in a metric is more often a sign of a data or logic error - a join that's duplicating rows, a date filter that's excluding more than intended - than a sign of genuine underlying business change, and confirming which one you're looking at before presenting the number protects both your credibility and the quality of whatever decision the number is meant to inform."
      ]
    },
    {
      "img": "d9-8.jpg",
      "notes": [
        "Let's recap quickly. Relational databases organize data into tables connected through primary and foreign keys, and SQL's core clauses - SELECT, WHERE, ORDER BY, JOIN, and GROUP BY - let you retrieve, filter, sort, combine, and summarize that data directly, without depending on someone else to answer every question for you. Power BI's workflow moves through four stages - Get Data, Power Query, the Data Model, and the Report canvas - and a good report answers a small number of clear questions well, using interactive slicers so different stakeholders can explore the same underlying data themselves. And a handful of validation habits - checking totals against known sources, labeling date ranges, honest chart scales, avoiding vanity metrics, and showing data freshness - are what separate a report people trust from one that quietly misleads.",
        "In our final course, we'll step back up to the strategic level with Strategy Analysis and Agile Analysis, and close out the program with practical mock-interview preparation for landing your first BA role. See you there."
      ]
    }
  ],
  "quiz": [
    {
      "q": "In a relational database, what is a foreign key?",
      "options": [
        "A key used to encrypt sensitive data",
        "A column that uniquely identifies each row in its own table",
        "A column in one table that references another table's primary key",
        "A password required to access the database"
      ],
      "correct": 2,
      "explanation": "Foreign keys are what let you join tables together, like connecting Orders to Customers via CustomerID."
    },
    {
      "q": "Which SQL clause is used to filter rows AFTER aggregation (e.g., after a GROUP BY)?",
      "options": [
        "WHERE",
        "ORDER BY",
        "HAVING",
        "SELECT"
      ],
      "correct": 2,
      "explanation": "WHERE filters individual rows before grouping; HAVING filters groups after aggregation."
    },
    {
      "q": "What is the correct order of Power BI's core workflow?",
      "options": [
        "Report Canvas \u2192 Data Model \u2192 Power Query \u2192 Get Data",
        "Get Data \u2192 Power Query \u2192 Data Model \u2192 Report Canvas",
        "Power Query \u2192 Get Data \u2192 Report Canvas \u2192 Data Model",
        "Data Model \u2192 Get Data \u2192 Report Canvas \u2192 Power Query"
      ],
      "correct": 1,
      "explanation": "Data is retrieved, then cleaned/transformed, then related to other tables, then visualized."
    },
    {
      "q": "Which visualization type is best suited to showing a trend over time?",
      "options": [
        "Pie chart",
        "Line chart",
        "Card",
        "Matrix"
      ],
      "correct": 1,
      "explanation": "Line charts are well suited to showing how a metric changes across a time period."
    },
    {
      "q": "Which of these is a recommended data validation habit before sharing a Power BI report?",
      "options": [
        "Start bar chart axes above zero to make trends look more dramatic",
        "Avoid labeling date ranges so the report looks cleaner",
        "Validate totals against a source you already trust, and show the data's last-refreshed date",
        "Use as many vanity metrics as possible to impress stakeholders"
      ],
      "correct": 2,
      "explanation": "Validating against a trusted source and showing data freshness are core habits that keep a report trustworthy."
    }
  ]
};
