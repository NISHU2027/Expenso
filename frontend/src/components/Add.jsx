import { X } from "lucide-react";
import { modalStyles } from "../assets/dummyStyles";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  loading = false, // FIX: added so the submit button can show busy state
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Salary", "Freelance", "Investments", "Bonus", "Other"],
  color = "teal"
}) => {
  if (!showModal) return null;

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];
  const minDate = `${currentYear}-01-01`;

  // FIX: fallback to {} instead of '' so colorClass.ring / .button never
  // throw if an unknown `color` prop is passed in
  const colorClass = modalStyles?.colorClasses?.[color] || {};

  return (
    <div className={modalStyles.overlay}>
        <div className={modalStyles.modalContainer}>
            <div className={modalStyles.modalHeader}>
                <h3 className={modalStyles.modalTitle}>
                    {title}
                </h3>
                <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={modalStyles.closeButton}
                    disabled={loading} // FIX: don't let user close mid-submit and lose state oddly
                >
                        <X size={24}/>
                </button>
            </div>

            <form onSubmit={(e) => {
                e.preventDefault();
                if (loading) return; // FIX: guard against double-submit via Enter key
                handleAddTransaction();
            }}>
                <div className={modalStyles.form}>
                    <div>
                        <label className={modalStyles.label}>Description</label>
                        <input
                        type="text"
                        value={newTransaction.description}
                        onChange={(e) =>
                            setNewTransaction((prev) => ({
                                ...prev,
                                description: e.target.value
                            }))
                        } 
                        className={modalStyles.input(colorClass.ring)}
                        placeholder={
                            type === "both"
                            ? "Salary, Funds, EventCounts."
                            : "Groceries, Rent, etc."
                        } 
                        required
                        disabled={loading}
                        />
                    </div>

                    <div>
                        <label className={modalStyles.label}>Amount</label>
                        <input
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) =>
                            setNewTransaction((prev) => ({
                               ...prev,
                                amount: e.target.value
                            }))
                        } 
                        className={modalStyles.input(colorClass.ring)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        required
                        disabled={loading}
                        />
                    </div>
                    
                    {type === "both" && (
                       <div>
                           <label className={modalStyles.label}>Type</label>
                               <div className={modalStyles.typeButtonContainer}>
                                   <button 
                                     type="button"
                                     className={modalStyles.typeButton(
                                         newTransaction.type === 'income', 
                                          modalStyles.colorClasses.teal.typeButtonSelected
                                        )}
                                        onClick={() => setNewTransaction(prev => ({...prev, type: 'income'}))}
                                        disabled={loading}
                                    >
                                            Income
                                    </button>
                                    <button 
                                      type="button"
                                      className={modalStyles.typeButton(
                                         newTransaction.type === 'expense', 
                                         modalStyles.colorClasses.orange.typeButtonSelected
                                        )}
                                    onClick={() => setNewTransaction(prev => ({...prev, type: 'expense'}))}
                                    disabled={loading}
                                    >
                                        Expense
                                    </button>
                              </div>
                        </div>
                    )}

                    <div>
                        <label className={modalStyles.label}>Category</label>
                        <select 
                        value={newTransaction.category}
                        onChange={(e) =>
                            setNewTransaction((prev) => ({
                                ...prev,
                                category: e.target.value
                            }))
                        } 
                        className={modalStyles.input(colorClass.ring)}
                        disabled={loading}
                        >
                            {categories.map((cat) => (
                                <option value={cat} key={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={modalStyles.label}>Date</label>
                        <input type="date" 
                        value={newTransaction.date}
                        onChange={(e) =>
                            setNewTransaction((prev) => ({
                                ...prev,
                                date: e.target.value,
                            }))
                        }
                        className={modalStyles.input(colorClass.ring)}
                        min={minDate}
                        max={currentDate}
                        required
                        disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={modalStyles.submitButton(colorClass.button)}
                        disabled={loading} // FIX: prevents rapid double-click double-POST
                    >
                        {loading ? "Saving..." : buttonText}
                    </button>
                    
                </div>
            </form>
        </div>
    </div>
  )
}

export default AddTransactionModal;