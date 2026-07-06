import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  dashboardStyles, 
  trendStyles, 
  chartStyles 
} from "../assets/dummyStyles";
import {
  GAUGE_COLORS,
  COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS,
} from "../assets/color";
import {
  getTimeFrameRange,
  getPreviousTimeFrameRange,
  calculateData,
  generateChartPoints,
} from "../components/Helpers";
import axios from 'axios';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Plus, Wallet, ArrowDown, TrendingUp, TrendingDown, PiggyBank, BarChart2, ShoppingCart, ChevronDown, ChevronUp, DollarSign, PieChart as PieChartIcon, ArrowUpRight as ProfitIcon, AlertCircle } from "lucide-react";
import FinancialCard from "../components/FinancialCard";
import GaugeCard from "../components/GaugeCard";
import AddTransactionModal from "../components/Add";
import { getAuthHeaders } from "../utils/auth";


import { API_BASE } from "../utils/api";

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDateKey(dateValue) {
  return getLocalDateInputValue(new Date(dateValue));
}

function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    const combined = new Date(`${dateValue}T${hhmmss}`);
    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

const Dashboard = () => {
  const outletContext = useOutletContext() || {};
  const {
    transactions: outletTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    refreshTransactions = async () => {},
  } = outletContext;

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    date: getLocalDateInputValue(),
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const [submitting, setSubmitting] = useState(false);

  const timeFrameRange = useMemo(() => getTimeFrameRange(timeFrame), [timeFrame]);
  const prevTimeFrameRange = useMemo(() => getPreviousTimeFrameRange(timeFrame), [timeFrame]);
  const chartPoints = useMemo(
    () => generateChartPoints(timeFrame, timeFrameRange),
    [timeFrame, timeFrameRange]
  );

  const isDateInRange = (date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return transactionDate >= startDate && transactionDate <= endDate;
  };

  const filteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) =>
      isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
    ),
    [outletTransactions, timeFrameRange]
  );

  const prevFilteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) =>
      isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end)
    ),
    [outletTransactions, prevTimeFrameRange]
  );

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [filteredTransactions]);

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [prevFilteredTransactions]);

  const derivedGaugeData = useMemo(() => {
    const maxValues = {
      income: Math.max(currentTimeFrameData.income, 5000),
      expenses: Math.max(currentTimeFrameData.expenses, 3000),
      savings: Math.max(Math.abs(currentTimeFrameData.savings), 2000),
    };

    return [
      { name: "Income", value: currentTimeFrameData.income, max: maxValues.income },
      { name: "Spent", value: currentTimeFrameData.expenses, max: maxValues.expenses },
      { name: "Savings", value: currentTimeFrameData.savings, max: maxValues.savings },
    ];
  }, [currentTimeFrameData]);

  const displayIncome =
    timeFrame === "monthly" && typeof overviewMeta.monthlyIncome === "number"
      ? overviewMeta.monthlyIncome
      : currentTimeFrameData.income;

  const displayExpenses =
    timeFrame === "monthly" && typeof overviewMeta.monthlyExpense === "number"
      ? overviewMeta.monthlyExpense
      : currentTimeFrameData.expenses;

  const displaySavings =
    timeFrame === "monthly" && typeof overviewMeta.savings === "number"
      ? overviewMeta.savings
      : currentTimeFrameData.savings;

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;
    if (!prev) {
      if (!curr) return 0;
      return 100;
    }
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);

  const financialOverviewData = useMemo(() => {
    if (
      timeFrame === "monthly" &&
      overviewMeta.expenseDistribution &&
      Array.isArray(overviewMeta.expenseDistribution) &&
      overviewMeta.expenseDistribution.length > 0
    ) {
      return overviewMeta.expenseDistribution.map((d) => ({
        name: d.category,
        value: Math.round(Number(d.amount) || 0),
      }));
    }

    const categories = {};
    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categories[transaction.category] =
          (categories[transaction.category] || 0) + transaction.amount;
      }
    });

    return Object.keys(categories).map((category) => ({
      name: category,
      value: Math.round(categories[category]),
    }));
  }, [filteredTransactions, overviewMeta, timeFrame]);

  const expenseDistributionTotal = useMemo(
    () => financialOverviewData.reduce((sum, item) => sum + Number(item.value || 0), 0),
    [financialOverviewData]
  );

  const trendChartData = useMemo(() => {
    const data = chartPoints.map((point) => ({
      ...point,
      key: timeFrame === "daily" ? String(point.hour) : getLocalDateKey(point.date),
      income: 0,
      expenses: 0,
      savings: 0,
    }));
    const dataByKey = new Map(data.map((point) => [point.key, point]));

    filteredTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const key =
        timeFrame === "daily"
          ? String(transactionDate.getHours())
          : getLocalDateKey(transactionDate);
      const chartPoint = dataByKey.get(key);

      if (!chartPoint) return;

      const amount = Math.round(Number(transaction.amount) || 0);
      if (transaction.type === "income") {
        chartPoint.income += amount;
      } else {
        chartPoint.expenses += amount;
      }
      chartPoint.savings = chartPoint.income - chartPoint.expenses;
    });

    return data;
  }, [chartPoints, filteredTransactions, timeFrame]);

  const serverRecent = overviewMeta.recentTransactions || [];
  const serverRecentIncome = serverRecent
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const serverRecentExpense = serverRecent
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = useMemo(
    () => filteredTransactions
      .filter((t) => t.type === "income")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions]
  );

  const expenseTransactions = useMemo(
    () => filteredTransactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions]
  );

  const incomeListForDisplay =
    timeFrame === "monthly" && serverRecentIncome.length > 0
      ? serverRecentIncome
      : incomeTransactions;

  const expenseListForDisplay =
    timeFrame === "monthly" && serverRecentExpense.length > 0
      ? serverRecentExpense
      : expenseTransactions;

  const displayedIncome = showAllIncome
    ? incomeListForDisplay
    : incomeListForDisplay.slice(0, 3);

  const displayedExpense = showAllExpense
    ? expenseListForDisplay
    : expenseListForDisplay.slice(0, 3);

  const gaugesForDisplay =
    timeFrame === "monthly" && gaugeData.length > 0
      ? gaugeData
      : derivedGaugeData;

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      setFetchError(null);

const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: getAuthHeaders(),
      });

      if (res?.data?.success) {
        const data = res.data.data;
        const recent = (data.recentTransactions || []).map((item) => {
          const typeFromServer = item.type || (item.category ? "expense" : "income");
          const amountNum = Number(item.amount) || 0;

          const isoDate = item.date
            ? new Date(item.date).toISOString()
            : item.createdAt
              ? new Date(item.createdAt).toISOString()
              : new Date().toISOString();

          return {
            id: item._id || item.id || Date.now() + Math.random(),
            date: isoDate,
            description:
              item.description ||
              item.note ||
              item.title ||
              (typeFromServer === "income" ? item.source || "Income" : item.category || "Expense"),
            amount: amountNum,
            type: typeFromServer,
            category:
              item.category || (typeFromServer === "income" ? "Salary" : "Other"),
            raw: item,
          };
        });

        setOverviewMeta((prev) => ({
          ...prev,
          monthlyIncome: Number(data.monthlyIncome || 0),
          monthlyExpense: Number(data.monthlyExpense || 0),
          savings:
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : Number(data.monthlyIncome || 0) - Number(data.monthlyExpense || 0),
          savingsRate:
            typeof data.savingsRate !== "undefined" ? data.savingsRate : null,
          spendByCategory: data.spendByCategory || {},
          expenseDistribution: data.expenseDistribution || [],
          recentTransactions: recent,
        }));

        if (timeFrame === "monthly") {
          const monthlyIncome = Number(data.monthlyIncome || 0);
          const monthlyExpense = Number(data.monthlyExpense || 0);
          const savings =
            typeof data.savings !== "undefined" ? Number(data.savings) : monthlyIncome - monthlyExpense;

          const maxValues = {
            income: Math.max(monthlyIncome, 5000),
            expenses: Math.max(monthlyExpense, 3000),
            savings: Math.max(Math.abs(savings), 2000),
          };

          setGaugeData([
            { name: "Income", value: monthlyIncome, max: maxValues.income },
            { name: "Spent", value: monthlyExpense, max: maxValues.expenses },
            { name: "Savings", value: savings, max: maxValues.savings },
          ]);
        }
      } else {
console.warn("Dashboard endpoint returned success:false", res?.data);
        setFetchError("Couldn't load the latest dashboard data. Showing local data instead.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard overview:", err?.response?.data || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame]);

  const handleAddTransaction = async () => {
    const parsedAmount = parseFloat(newTransaction.amount);
    if (
      !newTransaction.description?.trim() ||
      !newTransaction.amount ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setFetchError("Please enter a valid description and a positive amount.");
      return;
    }

    if (submitting) return;

    const payload = {
      date: toIsoWithClientTime(newTransaction.date),
      description: newTransaction.description.trim(),
      amount: parsedAmount,
      category: newTransaction.category,
    };

    try {
      setSubmitting(true);
      setLoading(true);
      setFetchError(null);

if (newTransaction.type === "income") {
        await axios.post(`${API_BASE}/income/add`, payload, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.post(`${API_BASE}/expense/add`, payload, {
          headers: getAuthHeaders(),
        });
      }

      await refreshTransactions();
      await fetchDashboardOverview();

      setNewTransaction({
        date: getLocalDateInputValue(),
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add Transactions:", err?.response || err.message || err);
      setFetchError("Couldn't save that transaction. Please try again.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className={dashboardStyles.container}>
      {fetchError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* header */}
      <div className={dashboardStyles.headerContainer}>
        <div className={dashboardStyles.headerContainer}>
          <div>
            <h1 className={dashboardStyles.headerTitle}>Finance Dashboard</h1>
            <p className={dashboardStyles.headerSubtitle}>
              Track your income and expenses
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={dashboardStyles.addButton}
            disabled={loading}
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
        <div className={dashboardStyles.timeFrameContainer}>
          <div className={dashboardStyles.timeFrameWrapper}>
            {["daily", "weekly", "monthly"].map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                disabled={loading}
                className={dashboardStyles.timeFrameButton(timeFrame === frame)}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={dashboardStyles.summaryGrid}>
        <FinancialCard
          icon={
            <div className={dashboardStyles.walletIconContainer}>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          }
          label="Total Balance"
          value={`₹${Math.round(displayIncome - displayExpenses).toLocaleString()}`}
          additionalContent={
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className={dashboardStyles.balanceBadge}>
                +₹{Math.round(displayIncome).toLocaleString()}
              </span>
              <span className={dashboardStyles.expenseBadge}>
                -₹{Math.round(displayExpenses).toLocaleString()}
              </span>
            </div>
          }
        />

        <FinancialCard
          icon={
            <div className={dashboardStyles.arrowDownIconContainer}>
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
          }
          label={`${timeFrameRange.label} Expenses`}
          value={`₹${Math.round(displayExpenses).toLocaleString()}`}
          additionalContent={
            <div className={`mt-2 text-xs flex items-center gap-1 ${
              expenseChange >= 0 ? trendStyles.positive : trendStyles.negative
            }`}>
              {expenseChange >= 0 ? (
                <TrendingUp className=" w-4 h-4" />
              ) : (
                <TrendingDown className=" w-4 h-4" />
              )}
              <span>
                {Math.abs(expenseChange)}%{" "}
                {expenseChange >= 0 ? "increase" : "decrease"} from{" "}
                {prevTimeFrameRange.label}
              </span>
            </div>
          }
        />

        <FinancialCard
          icon={
            <div className={dashboardStyles.piggyBankIconContainer}>
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          }
          label={`${timeFrameRange.label} Savings`}
          value={`₹${Math.round(displaySavings).toLocaleString()}`}
          additionalContent={
            <div className=" mt-2 text-xs text-cyan-600 flex items-center gap-2">
              <div className=" flex items-center gap-1">
                <BarChart2 className=" w-4 h-4" />
                <span>
                  {displayIncome > 0
                    ? Math.round((displaySavings / displayIncome) * 100)
                    : 0}
                  % of income
                </span>
              </div>

              {typeof overviewMeta.savingsRate === "number" && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    overviewMeta.savingsRate < 0
                      ? trendStyles.negativeRate
                      : trendStyles.positiveRate
                  }`}
                >
                  {overviewMeta.savingsRate}%
                </span>
              )}
            </div>
          }
        />
      </div>

      {/* Gauges */}
      <div className={dashboardStyles.gaugeGrid}>
        {(gaugesForDisplay || []).map((gauge) => (
          <GaugeCard
            key={gauge.name}
            gauge={gauge}
            colorInfo={GAUGE_COLORS[gauge.name]}
            timeFrameLabel={timeFrameRange.label}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-teal-500" />
            Financial Trend
            <span className={dashboardStyles.listSubtitle}>({timeFrameRange.label})</span>
          </h3>
        </div>

        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData} margin={{ top: 10, right: 18, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id="dashboardIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="dashboardExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                interval={timeFrame === "daily" ? 2 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                width={58}
                tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `₹${Math.round(Number(value) || 0).toLocaleString()}`,
                  name === "expenses" ? "Expenses" : "Income",
                ]}
                contentStyle={dashboardStyles.tooltipContent}
                itemStyle={dashboardStyles.tooltipItem}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#0d9488"
                fill="url(#dashboardIncomeGradient)"
                strokeWidth={2}
                activeDot={{ r: 5, fill: "#0d9488" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f97316"
                fill="url(#dashboardExpenseGradient)"
                strokeWidth={2}
                activeDot={{ r: 5, fill: "#f97316" }}
              />
              {trendChartData.map(
                (point, index) =>
                  point.isCurrent && (
                    <ReferenceLine
                      key={index}
                      x={point.label}
                      stroke="#0891b2"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  )
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense distribution pie */}
      <div className={dashboardStyles.pieChartContainer}>
        <div className={dashboardStyles.pieChartHeader}>
          <h3 className={dashboardStyles.pieChartTitle}>
            <PieChartIcon className="w-6 h-6 text-teal-500" />
            Expense Distribution
            <span className={dashboardStyles.listSubtitle}> ({timeFrameRange.label})</span>
          </h3>
        </div>

        <div className={dashboardStyles.pieChartHeight}>
          {financialOverviewData.length === 0 ? (
            <div className={dashboardStyles.emptyState}>
              <div className={dashboardStyles.emptyIconContainer("bg-teal-50")}>
                <PieChartIcon className="w-8 h-8 text-teal-400" />
              </div>
              <p className={dashboardStyles.emptyText}>No expense data for this period</p>
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart className={chartStyles.pieChart}>
                  <Pie
                    data={financialOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={112}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {financialOverviewData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Math.round(value).toLocaleString()}`, "Amount"]}
                    contentStyle={dashboardStyles.tooltipContent}
                    itemStyle={dashboardStyles.tooltipItem}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="min-h-0 w-full space-y-2 overflow-y-auto pr-1">
                {financialOverviewData.map((entry, index) => {
                  const percent =
                    expenseDistributionTotal > 0
                      ? Math.round((Number(entry.value || 0) / expenseDistributionTotal) * 100)
                      : 0;

                  return (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate text-sm font-medium text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-800">{percent}%</p>
                        <p className="text-xs text-gray-500">
                          ₹{Math.round(Number(entry.value || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={dashboardStyles.listsGrid}>
        {/* Income Column */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className={dashboardStyles.listTitle}>
              <ProfitIcon className="w-6 h-6 text-green-500" /> Recent Income{" "}
              <span className={dashboardStyles.listSubtitle}> ({timeFrameRange.label})</span>
            </h3>
            <span className={dashboardStyles.incomeCountBadge}>
              {incomeListForDisplay.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedIncome.map((transaction) => {
              const IconComponent = INCOME_CATEGORY_ICONS[transaction.category] || INCOME_CATEGORY_ICONS.Other;
              return (
                <div key={transaction.id} className={dashboardStyles.incomeTransactionItem}>
                  <div className={dashboardStyles.transactionContent}>
                    <div className={dashboardStyles.incomeIconContainer}>
                      {IconComponent}
                    </div>
                    <div>
                      <p className={dashboardStyles.transactionDescription}>{transaction.description}</p>
                      <p className={dashboardStyles.transactionCategory}>{transaction.category}</p>
                    </div>
                  </div>
                  <div className={dashboardStyles.transactionAmount}>
                    <p className={dashboardStyles.incomeAmount}>+₹{Math.abs(transaction.amount).toLocaleString()}</p>
                    <p className={dashboardStyles.transactionDate}>{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}

            {incomeListForDisplay.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div className={dashboardStyles.emptyIconContainer("bg-green-50")}>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <p className={dashboardStyles.emptyText}>No income transactions</p>
              </div>
            )}

            {incomeListForDisplay.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllIncome(!showAllIncome)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllIncome ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Income ({incomeListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expense Column */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className="text-lg md:text-xl lg:text-xl xl:text-xl font-bold text-gray-800 md:mt-3 mt-3 flex items-center gap-3">
              <ArrowDown className="w-6 h-6 text-orange-500" /> Recent Expenses{" "}
              <span className={dashboardStyles.listSubtitle}> ({timeFrameRange.label})</span>
            </h3>
            <span className={dashboardStyles.expenseCountBadge}>
              {expenseListForDisplay.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedExpense.map((transaction) => {
              const IconComponent = EXPENSE_CATEGORY_ICONS[transaction.category] || EXPENSE_CATEGORY_ICONS.Other;
              return (
                <div key={transaction.id} className={dashboardStyles.expenseTransactionItem}>
                  <div className={dashboardStyles.transactionContent}>
                    <div className={dashboardStyles.expenseIconContainer}>
                      {IconComponent}
                    </div>
                    <div>
                      <p className={dashboardStyles.transactionDescription}>{transaction.description}</p>
                      <p className={dashboardStyles.transactionCategory}>{transaction.category}</p>
                    </div>
                  </div>
                  <div className={dashboardStyles.transactionAmount}>
                    <p className={dashboardStyles.expenseAmount}>-₹{Math.abs(transaction.amount).toLocaleString()}</p>
                    <p className={dashboardStyles.transactionDate}>{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}

            {expenseListForDisplay.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div className={dashboardStyles.emptyIconContainer("bg-orange-50")}>
                  <ShoppingCart className="w-8 h-8 text-orange-400" />
                </div>
                <p className={dashboardStyles.emptyText}>No expense transactions</p>
              </div>
            )}

            {expenseListForDisplay.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllExpense(!showAllExpense)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllExpense ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Expenses ({expenseListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading || submitting}
      />
    </div>
  );
};

export default Dashboard;
