import React from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function CreateExpense() {
    const [categories, setCategories] = React.useState([]);
     React.useEffect(() => {
        axios.get('http://34.63.225.128:8081/categories')
          .then(res => setCategories(res.data))
          .catch(err => console.log(err));
    }, []);

    const [categoryName, setCategoryName] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [date, setDate] = React.useState('');
    const [expenseDescription, setExpenseDescription] = React.useState('');
    const [necessity, setNecessity] = React.useState('');
    const navigate = useNavigate();
    
    
    function handleSubmit(event) {
        event.preventDefault(); //doesn't reload the page when the form is submitted, allowing us to handle the form submission with JavaScript instead of the default browser behavior.
        axios.post('http://34.63.225.128:8081/create', {    
            category_name: categoryName,
            amount: amount,
            date: date,
            expense_description: expenseDescription,
            necessity: necessity
        })
        .then(res => {console.log(res.data);
        navigate('/expense');}) //naviage to the /expenses page after the expense is successfully created
        .catch(err => console.log(err));
    }

    return (
        <div className='d-flex flex-column vh-100 bg-success-subtle justify-content-center align-items-center'>
            <h1 style={{ fontFamily: 'cursive', color: '#ec88e7', textAlign: 'center', marginBottom: '20px' }}>Expense Tracker</h1>
            <div className ='w-100 bg-white rounded p-3'>
                 <h2 style={{ fontFamily: 'cursive', textAlign: 'center', marginBottom: '20px' }}>Create Expense</h2>
                <form onSubmit = {handleSubmit}>
                    <div className='mb-2'>
                        <label htmlFor='category_name'>Category Name</label>
                        <select className='form-control' onChange={e => setCategoryName(e.target.value)} value={categoryName}>
                            <option value=''>Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_name}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='amount'>Amount</label>
                        <input type='number' placeholder='Enter amount' className='form-control' 
                        onChange={e => setAmount(e.target.value)} value={amount}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='date'>Date</label>
                        <input type='date' placeholder='Enter date' className='form-control' 
                        onChange={e => setDate(e.target.value)} value={date}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='expense_description'>Expense Description</label>
                        <input type='text' placeholder='Enter expense description' className='form-control' 
                        onChange={e => setExpenseDescription(e.target.value)} value={expenseDescription}
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='necessity'>Necessity</label>
                        <select className='form-control' onChange={e => setNecessity(e.target.value)} value={necessity}>
                            <option value=''>Select necessity</option>
                            <option value='true'>True</option>
                            <option value='false'>False</option>
                        </select>
                    </div>
                    <button className='btn btn-success'>Create</button>
                </form>
            </div>
        </div>
    )
}

export default CreateExpense