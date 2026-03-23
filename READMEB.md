# WordBridge - Academic Word List Learning Tool

An interactive web application to help English learners master the Academic Word List (AWL) through practice with real academic collocations.

## 📊 Project Statistics

| Metric | Number | Details |
|--------|--------|---------|
| **AWL Words** | 570 | Complete Academic Word List |
| **Words with Collocations** | 552 | 97% coverage |
| **Total Collocations** | 7,918 | From research articles |
| **Lemmas (Word Forms)** | 3,111 | All word variations |
| **Database Size** | 360KB | Fast, lightweight SQLite |

## ✨ Core Features

### 1. Complete AWL Coverage
- All 570 headwords from the official Academic Word List
- Each word includes its full word family (lemmas)
- Sourced from Victoria University of Wellington

### 2. Academic Collocations (7,918)
- Extracted from the LOCRA database (research articles)
- Real academic usage, not generated examples
- Includes phrases like:
  - "analyse data"
  - "conduct research"
  - "significant difference"
  - "statistical analysis"


##  Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js + Express | 
| **Database** | SQLite |
| **Data Source** | LOCRA Database |

## 📋 Prerequisites

- **Node.js** v16 or higher 
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/FirmS26/WordBridge.git
cd WordBridge

### 2. Switch to the Branch You Want

# For Brisa's v2 files:
git checkout brisa-v2-update

### 3. Install Dependencies

npm install
### 4. Start the Server

node server.js
5. Open in Browser

http://localhost:3000
 Project Structure

text
WordBridge/
├── server.js                 # Main server
├── package.json              # Dependencies
├── public/                   # Frontend files
│   ├── index.html           # Welcome page
│   ├── words.html           # AWL word list
│   ├── word.html            # Sentence input
│   ├── result.html          # Results page
│   └── signup.html          # Sign up page (demo)
├── grammar-engine/           # Future grammar checking
│   └── check.py
├── awl.db                    # Database (ready to use)
├── awl-words-with-coll.json  # Word data
├── setup-db.js               # Database setup
├── seed-from-json.js         # Database seeder
├── .gitignore                # Files ignored by Git
└── README.md                 # This file
 How to Use

Start at http://localhost:3000
Click the Play button to see the word list
Select a word (e.g., "analyse")
Write a sentence using that word
Get feedback on your sentence
View word forms and common collocations
Branches

Branch	Description
main	Team's main/stable code
brisa-v2-update	Brisa's v2 files with updated frontend
Brisa's-Branch	Brisa's v1 files
victors-branch	Victor's work
Karl's-Branch	Karl's work
Tao's-Branch	Tao's work
 Database Commands (If Needed)

Only run these if you delete awl.db or want to start fresh:

bash
# Create empty tables
node setup-db.js

# Fill with data from JSON
node seed-from-json.js

 Troubleshooting

Problem	Solution
node: command not found	Install Node.js from nodejs.org
npm install fails	Try sudo npm install (Mac/Linux) or run as admin (Windows)
No words showing	Check that awl.db exists in the root folder
"Word not found" error	Try a common word like "analyse"
Port 3000 in use	Change PORT in server.js or close the other app
 Data Sources

AWL Words: Victoria University of Wellington
Collocations: LOCRA Database (UCLouvain) - CC BY-NC-SA 4.0

 Future Features (hopefully)


Grammar checking with Gramformer
User accounts and progress tracking
Sentence history and favorites
Mobile app version
