const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require('mongoose');


const usersUrl = 'http://localhost:3001';
const costsUrl = 'http://localhost:3002';
const adminUrl = 'http://localhost:3003';
const logsUrl  = 'http://localhost:3004';

describe('Cost Manager API Tests', function() {

    
    describe('Admin Service', function() {
        it('should return team members', async function() {
            const res = await request(adminUrl).get('/api/about');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            
            if (res.body.length > 0) {
                expect(res.body[0]).to.have.property('first_name');
            }
        });
    });

    
    describe('Users & Costs Flow', function() {
        const testId = 999999;

        it('should create a new user', async function() {
            
            

            const res = await request(usersUrl).post('/api/add').send({
                id: testId,
                first_name: "Test",
                last_name: "User",
                birthday: "2000-01-01"
            });

            
            
            expect([201, 500]).to.include(res.status);
        });

        it('should add a cost item', async function() {
            const res = await request(costsUrl).post('/api/add').send({
                description: "Test Burger",
                category: "food",
                userid: testId,
                sum: 50
            });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('sum', 50);
        });

        it('should get user details with updated total', async function() {
            const res = await request(usersUrl).get(`/api/users/${testId}`);
            expect(res.status).to.equal(200);
            
            expect(res.body).to.have.property('total');
            expect(res.body.total).to.be.at.least(50);
        });

        it('should fail adding cost for non-existing user', async function() {
            
            
            const res = await request(costsUrl).post('/api/add').send({
                description: "Ghost Item",
                category: "food",
                userid: 111222333, 
                sum: 100
            });
            
            expect(res.status).to.equal(500);
        });
    });

    
    describe('Report Service', function() {
        it('should return a computed report', async function() {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;

            
            const res = await request(costsUrl).get('/api/report')
                .query({ id: 123123, year: year, month: month });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('costs');
            expect(res.body.costs).to.be.an('array');
        });
    });

    
    describe('Logs Service', function() {
        it('should return logs array', async function() {
            const res = await request(logsUrl).get('/api/logs');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });
});