const axios = require('axios');

async function runTest() {
    try {
        console.log('--- 1. Testing About (Admin Service - Port 3003) ---');
        
        const about = await axios.get('http://localhost:3003/api/about');
        console.log('Team:', about.data);

        console.log('\n--- 2. Adding a Cost (Costs Service - Port 3002) ---');
        
        const newCost = await axios.post('http://localhost:3002/api/add', {
            description: "chocolate",
            category: "food",
            userid: 123123,
            sum: 10,
            createdAt: new Date()
        });
        console.log('Cost Added:', newCost.data);

        console.log('\n--- 3. Getting User Details (Users Service - Port 3001) ---');
        
        const user = await axios.get('http://localhost:3001/api/users/123123');
        console.log('User Details:', user.data);

        console.log('\n--- 4. Getting Monthly Report (Costs Service - Port 3002) ---');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        
        const report = await axios.get(`http://localhost:3002/api/report?id=123123&year=${currentYear}&month=${currentMonth}`);
        console.log('Report Data Found (Costs array length):', report.data.costs.length);

        console.log('\n--- 5. Testing Logs (Logs Service - Port 3004) ---');
        
        const logs = await axios.get('http://localhost:3004/api/logs');
        console.log('Logs Found:', logs.data.length > 0 ? 'Yes' : 'No');

        console.log('\n✅ TEST PASSED SUCCESSFULLY');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response ? error.response.data : error.message);
    }
}

runTest();