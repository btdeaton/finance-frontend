# Personal Finance Tracker

A comprehensive web application for tracking personal finances, managing budgets, and visualizing spending patterns. This frontend React application provides an intuitive interface for managing your financial data.

![Personal Finance Tracker](https://imgur.com/a/6nDfzyH)

## Features

- **Dashboard** - Overview of spending trends, recent transactions, and budget status
- **Transactions** - Add, edit, and delete financial transactions
- **Categories** - Organize transactions by customizable categories
- **Budgets** - Create and manage budgets for different expense categories
- **Reports** - Visual analytics of spending patterns and financial health

## Tech Stack

- React 
- Material UI
- Recharts (for data visualization)
- Axios (for API communications)
- React Router (for navigation)

## Getting Started

### Prerequisites

- Node.js (v16.x or later)
- npm or yarn
- Access to the [Personal Finance API](http://localhost:8000/docs) (FastAPI backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. The application will be available at `http://localhost:3000`

## API Backend

This frontend application requires the Personal Finance API to function properly. The API provides data storage, authentication, and business logic.

- **API Documentation**: View the FastAPI Swagger documentation at [http://localhost:8000/docs](http://localhost:8000/docs)
- **Default API URL**: http://localhost:8000

For information on setting up the API, please follow the instructions in the [Personal Finance API repository](https://github.com/yourusername/personal-finance-api).

## Authentication

The application uses JWT token-based authentication. When logging in, the user receives a token that is stored in localStorage and attached to subsequent API requests via an Authorization header.

## Structure

```
personal-finance-tracker/
├── public/              # Static files
├── src/                 # Source code
│   ├── api/             # API client configuration and service modules
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (auth, etc.)
│   ├── pages/           # Page components
│   └── App.js           # Main application component
└── package.json         # Project dependencies and scripts
```

## Known Issues

- The application currently has a timezone issue when creating transactions. The API expects dates in UTC format.
- When adding transactions, the form may occasionally report an error even when the transaction is successfully created. This is being addressed.

## Troubleshooting

### API Connection Issues

If you encounter API connection issues:

1. Ensure the backend API is running at `http://localhost:8000`
2. Check that CORS is properly configured on the backend
3. Verify that your authentication token is valid

### Date Handling Errors

If you encounter errors when creating transactions:

```
Error: can't compare offset-naive and offset-aware datetimes
```

This is related to how the API handles date formats. As a workaround, ensure that you're sending the date in the ISO format without timezone information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Material UI](https://mui.com/) for the UI components
- [Recharts](https://recharts.org/) for data visualization
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API framework
