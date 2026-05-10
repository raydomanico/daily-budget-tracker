if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

const DAILY_LIMIT=250;
const CATEGORY_SALARY="Salary";
const CATEGORY_DAILY_SAVINGS="Daily Budget Savings";
const CATEGORY_DAILY_BUDGET="Daily Budget";
const CATEGORY_OTHER_ACCOUNTS="Others";



const inputBudgetEl=document.getElementById("inputBudget");
const dailyBudgetEl=document.getElementById("daily-budget");
const transactionHistoryListEl=document.getElementById("transaction-history");
const spendCategoryEl=document.getElementById("spend-category");
const purchaseCategoryEl=document.getElementById("purchase-category");
const depositCategoryEl=document.getElementById("deposit-category");
const spendCategoryNameEl=document.getElementById("spend-category-name");
const confirmSpendBudgetEl=document.getElementById("confirm-spend-budget");
const confirmAddBudgetEl=document.getElementById("confirm-add-budget");
const salaryEl=document.getElementById("salary");
const dailySavingsEl=document.getElementById("daily-savings");
const otherAccountsEl=document.getElementById("others");
const inputInvalidMsgEl=document.getElementById("input-invalid-msg");
const editBudgetEl=document.getElementById("edit-budget");
const resetAllBudgetEl=document.getElementById("reset-all-budget");
const transactionNotificationEl=document.getElementById("transaction-notification");


const root = getComputedStyle(document.documentElement);
const accentColor = root.getPropertyValue('--color-accent');
const dangerColor = root.getPropertyValue('--color-danger');

document.getElementById("deposit").addEventListener("click", addBudget);
document.getElementById("spend").addEventListener("click", spendBudget);
document.getElementById("reset-daily-budget").addEventListener("click", resetBudget);
document.getElementById("confirm-spend-budget").addEventListener("click", confirmSpendBudget);
document.getElementById("confirm-add-budget").addEventListener("click", confirmAddBudget);
document.getElementById("reset-all-budget").addEventListener("click", resetAllBudget);



const appState={
    dailyBudget:parseFloat(localStorage.getItem('myDailyBudget'))||DAILY_LIMIT,
    salary:parseFloat(localStorage.getItem('mySalary'))||0,
    dailySavings:parseFloat(localStorage.getItem('myDailySavings'))||0,
    otherAccounts:parseFloat(localStorage.getItem('myOtherAccounts'))||0,
    dailyBudgetSource:CATEGORY_SALARY,
    transactionHistory:JSON.parse(localStorage.getItem('myTransactionHistory'))||[]

}

function addBudget(){
    hideDropdowns();
     depositCategoryEl.style.display="block"
     confirmAddBudgetEl.style.display="block"


    //1.Validate Input Amount
    
};
function getAccountKey(category){
    if(category== CATEGORY_SALARY)         return "salary";
    if(category== CATEGORY_DAILY_BUDGET)   return "dailyBudget";
    if(category== CATEGORY_OTHER_ACCOUNTS) return "otherAccounts";
    if(category== CATEGORY_DAILY_SAVINGS)  return "dailySavings";


}
function confirmAddBudget(){
const inputAmount=getValidAmount()
if(inputAmount==null){

    return null;
}
const key=getAccountKey(depositCategoryEl.value);
appState[key] += inputAmount;

//Clear the input box for next input
inputBudgetEl.value=""; 
appState.transactionHistory.push({type: "Deposit",amount:inputAmount,category:depositCategoryEl.value,name:""});

console.log(appState.dailyBudget);
showNotification("Deposit Transaction Success!!","success")
syncStorage();
renderUI(); 
console.log("addBudget ran", appState)
};

function spendBudget(){
    hideDropdowns();
     spendCategoryEl.style.display="block"
     spendCategoryNameEl.style.display="block"
     confirmSpendBudgetEl.style.display="block"
     purchaseCategoryEl.style.display="block"
    
}   

function confirmSpendBudget(){

const inputAmount=getValidAmount()
if(inputAmount==null){
    return null;
}
const key= getAccountKey(spendCategoryEl.value);
if(inputAmount>appState[key]){
    showNotification("Invalid Transaction, Check the amount Carefully","error");
return;
};
appState[key]-=inputAmount;

 inputBudgetEl.value="";
 appState.transactionHistory.push({type:"Spend" ,category:spendCategoryEl.value , name:spendCategoryNameEl.value , amount:inputAmount});

console.log( appState.transactionHistory);
showNotification("Spending Transaction Success","success");  
 syncStorage();
 renderUI();
}

function getValidAmount(){
    const value=parseFloat(inputBudgetEl.value);

    if(isNaN(value)||value<=0){
            inputInvalidMsgEl.style.display="block";
            return;
     
    }
     inputInvalidMsgEl.style.display="none";
return value;
}

function resetBudget(){
      if(appState.salary<=0){
        showNotification("Cannot reset the budget today, You have no Enough Account Balance","error")
        return;
    }
appState.dailySavings+=appState.dailyBudget;
appState.salary-=DAILY_LIMIT;
appState.transactionHistory.push({type:"Reset", amount:appState.dailyBudget, category:depositCategoryEl.value});

appState.dailyBudget=DAILY_LIMIT; 



syncStorage();
renderUI();

};
function resetAllBudget(){
  
appState.salary=0;
appState.dailyBudget=0;
appState.dailySavings=0;
appState.otherAccounts=0; 
appState.transactionHistory=[];
syncStorage();
renderUI();
}


function syncStorage(){
localStorage.setItem('myDailyBudget', appState.dailyBudget);
localStorage.setItem('mySalary', appState.salary);
localStorage.setItem('myDailySavings', appState.dailySavings);
localStorage.setItem('myOtherAccounts', appState.otherAccounts)
localStorage.setItem('myTransactionHistory', JSON.stringify(appState.transactionHistory));
};

function renderUI(){

salaryEl.textContent=`₱${appState.salary.toFixed(2)}`;
dailySavingsEl.textContent=`₱${appState.dailySavings.toFixed(2)}`;
otherAccountsEl.textContent=`₱${appState.otherAccounts.toFixed(2)}`;
dailyBudgetEl.textContent=`₱${appState.dailyBudget.toFixed(2)}`;
transactionHistoryListEl.innerHTML="";
for( let i=0; i<appState.transactionHistory.length ; i++){
const liEl=document.createElement("li");

if(appState.transactionHistory[i].name){
liEl.textContent=`₱${appState.transactionHistory[i].amount}`+`-${appState.transactionHistory[i].type}-${appState.transactionHistory[i].category}-${appState.transactionHistory[i].name}`;
transactionHistoryListEl.append(liEl)}
else{
liEl.textContent=`₱${appState.transactionHistory[i].amount}`+`-${appState.transactionHistory[i].type}-${appState.transactionHistory[i].category}`;
transactionHistoryListEl.append(liEl)};

};  
  hideDropdowns()
}

function showNotification(message,type) {
transactionNotificationEl.style.background= type ==="error"?dangerColor:accentColor;
transactionNotificationEl.textContent=message;
transactionNotificationEl.style.display="block";
setTimeout(function(){
transactionNotificationEl.style.display="none"
}, 3000);

};
function hideDropdowns(){
   spendCategoryNameEl.value=""
     spendCategoryNameEl.style.display="none"
     confirmSpendBudgetEl.style.display="none"
     spendCategoryEl.style.display="none"
     depositCategoryEl.style.display="none"     
     confirmAddBudgetEl.style.display="none"
     purchaseCategoryEl.style.display="none"
}



renderUI();
