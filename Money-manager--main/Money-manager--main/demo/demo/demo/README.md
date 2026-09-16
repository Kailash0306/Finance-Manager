# Money Manager Backend

Spring Boot (Maven) REST API for the Money Manager application. Uses MongoDB for storage.

## Requirements

- Java 17+
- Maven
- MongoDB (local or MongoDB Atlas)

## Configuration

MongoDB Atlas connection is set in **`MongoConfig`** (Atlas URI) and in **`application.properties`**. Database: `money_manager`.

**If you see SSL "internal_error"** when connecting to Atlas: the app uses TLS 1.2 by default. If it still fails, try a different network (e.g. mobile hotspot) or in IntelliJ add VM option: `-Djdk.tls.client.protocols=TLSv1.2`.

## Build & Run

```bash
mvn clean package -DskipTests
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

Or:

```bash
mvn spring-boot:run
```

Server runs on **http://localhost:8081**

## API Endpoints

### Transactions
- `POST   /api/transactions`       – Add income or expense
- `GET    /api/transactions`       – List (optional: `startDate`, `endDate`, `division`, `category`, `type`)
- `GET    /api/transactions/{id}`   – Get one
- `PUT    /api/transactions/{id}`   – Update (allowed only within 12 hours of creation)
- `DELETE /api/transactions/{id}`   – Delete (allowed only within 12 hours of creation)

### Dashboard
- `GET /api/dashboard/summary?period=monthly|weekly|yearly` – Income/expense by period
- `GET /api/dashboard/history?limit=50` – Recent transaction history

### Categories
- `GET /api/categories`        – Summary per category (totals, counts)
- `GET /api/categories/names`  – List of category names used in transactions
- `GET /api/categories/suggested` – Suggested categories (fuel, movie, food, loan, medical, etc.)

### Divisions
- `GET /api/divisions` – List divisions: OFFICE, PERSONAL

### Transaction Types
- `GET /api/transaction-types` – List types: INCOME, EXPENSE

### Accounts
- `POST   /api/accounts`              – Create account
- `GET    /api/accounts`              – List accounts
- `GET    /api/accounts/{id}`         – Get one
- `GET    /api/accounts/{id}/transactions` – Account transactions (income/expense for this account)
- `PUT    /api/accounts/{id}`         – Update
- `DELETE /api/accounts/{id}`         – Delete
- `POST   /api/accounts/transfer`     – Transfer between accounts

## Request Examples

**Add transaction (income/expense):**
```json
POST /api/transactions
{
  "type": "INCOME",
  "amount": 5000,
  "dateTime": "2025-02-02T10:00:00",
  "description": "Salary",
  "category": "salary",
  "division": "PERSONAL",
  "accountId": "optional-account-id"
}
```

**Transfer between accounts:**
```json
POST /api/accounts/transfer
{
  "fromAccountId": "id1",
  "toAccountId": "id2",
  "amount": 500,
  "dateTime": "2025-02-02T12:00:00",
  "description": "Monthly transfer"
}
```

**Enums:** `type`: `INCOME` | `EXPENSE`; `division`: `OFFICE` | `PERSONAL`

Categories: use suggested list from `GET /api/categories/suggested` or any free text. Account balance is updated automatically when transactions (with accountId) are added, updated, or deleted.
