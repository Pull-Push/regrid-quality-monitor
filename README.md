# Regrid Data Quality Monitor

> An automated data quality monitoring system for parcel data from the Regrid API

![Quality Score](https://img.shields.io/badge/Quality%20Score-95%2F100-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Overview

A three-stage automated pipeline that collects parcel data from Regrid's REST API, validates it across 15 quality dimensions, and generates a beautiful HTML dashboard showing actionable quality metrics.

---

## ✨ Features

- **📊 Comprehensive Validation** - 15 checks across 8 categories (geometry, address, property, identifiers, zoning, building, metadata)
- **🎨 Visual Dashboard** - Interactive HTML reports with color-coded results
- **⚡ Graduated Scoring** - 0-100 point scale prioritizes critical issues
- **📈 Actionable Insights** - Category breakdowns show exactly where data needs improvement
- **🔄 Automated Pipeline** - Single command runs collection → validation → reporting

---

## 📸 Screenshots

### Dashboard Overview
*95/100 overall quality score with category breakdowns*

### Individual Parcel Results
*Detailed pass/fail metrics for each validation check*

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Regrid API key ([Get one here](https://regrid.com/))

### Installation
```bash
# Clone the repository
git clone https://github.com/Pull-Push/regrid-quality-monitor.git
cd regrid-quality-monitor

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your REGRID_API_KEY
```

### Usage
```bash
# Run the complete pipeline
npm run monitor

# Or run stages individually:
npm run collect   # Fetch parcel data
npm run validate  # Run quality checks
npm run report    # Generate HTML dashboard
```

**View Results:**
Open `reports/report-[timestamp].html` in your browser

---

## 🏗️ Architecture
```
regrid-quality-monitor/
├── src/
│   ├── collectors/         # API data collection
│   │   └── parcelCollector.js
│   ├── validators/         # Quality check logic
│   │   ├── qualityChecks.js    (15 validation functions)
│   │   └── qualityValidator.js (orchestration)
│   └── reporters/          # Report generation
│       └── htmlReporter.js
├── data/                   # Validation results (JSON)
├── reports/                # Generated dashboards (HTML)
├── .env.example           # Environment template
└── package.json
```

### Data Flow
```
1. Collector → Regrid API → Raw parcel data (GeoJSON)
2. Validator → 15 quality checks → Scores & results (JSON)
3. Reporter → Aggregate statistics → Visual dashboard (HTML)
```

---

## 📋 Validation Checks

### Geometry (2 checks)
- ✅ Valid polygon structure (closed rings, 4+ points)
- ✅ Coordinate validity (lat/lon within bounds)

### Address (3 checks)
- ✅ Address format and completeness
- ✅ Valid 2-letter state code
- ✅ Valid 5-digit ZIP code

### Property Data (4 checks)
- ✅ Owner information present
- ✅ Property valuation data
- ✅ Year built (1700-present)
- ✅ Lot size consistency (acres ↔ sqft)

### Identifiers (2 checks)
- ✅ UUID format validation
- ✅ Parcel number present

### Validation (1 check)
- ✅ USPS delivery point validation (DPV)

### Zoning (1 check)
- ✅ Zoning code and description

### Building (1 check)
- ✅ Building footprint data

### Metadata (1 check)
- ✅ Data freshness (<6 months)

---

## 📊 Example Output
```json
{
  "statistics": {
    "averageScore": 95,
    "totalParcels": 7,
    "totalChecks": 105,
    "passRate": 92,
    "categoryScores": {
      "geometry": 100,
      "address": 100,
      "property": 94,
      "identifiers": 100,
      "validation": 86,
      "zoning": 71,
      "building": 96,
      "metadata": 100
    },
    "topFailures": [
      { "check": "Zoning Data", "failures": 2 },
      { "check": "Year Built", "failures": 2 }
    ]
  }
}
```

---

## 🎓 Learning Outcomes

This project demonstrates:

- **API Integration** - REST API consumption with error handling and rate limiting
- **Data Validation** - Domain-specific business logic for GIS data
- **Software Architecture** - Separation of concerns (collectors/validators/reporters)
- **Data Visualization** - Converting raw metrics into actionable insights
- **Production Practices** - Environment variables, error handling, documentation

---

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **HTTP Client:** axios
- **Environment Config:** dotenv
- **Data Format:** GeoJSON (RFC 7946)
- **Output:** HTML5 + CSS3

---

## 🔮 Future Enhancements

- [ ] **File Upload** - Validate user-provided GeoJSON/Shapefiles
- [ ] **Quick Check UI** - Single-address instant validation
- [ ] **Historical Tracking** - Track quality trends over time
- [ ] **Custom Rules** - User-defined validation logic
- [ ] **Batch Processing** - Handle 1M+ parcels efficiently
- [ ] **TypeScript Migration** - Type safety for production use
- [ ] **Unit Tests** - Jest test suite for all validators

---

## 📝 Configuration

### Environment Variables
```bash
# .env
REGRID_API_KEY=your_api_key_here
```

### Test Addresses

Edit `src/collectors/parcelCollector.js` to modify test addresses:
```javascript
const TEST_ADDRESSES = [
  '5818 Diana Dr, Garland, TX',
  '6535 N Ewing St, Indianapolis, IN',
  // Add more...
];
```

---

## 🤝 Contributing

This is a portfolio/demonstration project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add new validation check'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this for learning or inspiration!

---

## 👤 Author

**Jeff Sokol**
- GitHub: [@Pull-Push](https://github.com/Pull-Push)
- LinkedIn: [Jeff Sokol - LinkedIn](https://www.linkedin.com/in/jeffrey-sokol/)
- Portfolio: [JeffreyScottSokol.com](https://jeffreyscottsokol.com/)

---

## 🙏 Acknowledgments

- **Regrid** - For providing a comprehensive parcel data API
- **GeoJSON Specification (RFC 7946)** - For standardized geographic data format
- Built as a portfolio project to demonstrate data quality engineering skills

---

## 📚 Resources

- [Regrid API Documentation](https://developer.regrid.com/reference/getting-started-with-your-api)
- [GeoJSON Specification](https://datatracker.ietf.org/doc/html/rfc7946)
- [USPS Address Validation](https://www.usps.com/business/web-tools-apis/)

---

**⭐ If you found this project interesting, please consider giving it a star!**
