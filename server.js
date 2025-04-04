const express = require('express');
const dns = require('dns').promises;
const whois = require('whois-json');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Function to get information about an IP address
async function getIpInfo(ip, type = 'IPv4') {
    try {
        const whoisData = await whois(ip);
        return {
            ip,
            type,
            organization: whoisData.orgName || whoisData.org || whoisData.organization || whoisData.Organisation,
            netname: whoisData.netname || whoisData.NetName,
            country: whoisData.country || whoisData.Country,
            description: whoisData.descr || whoisData.Description,
            abuse: whoisData.abuseEmail || whoisData.abuse || whoisData['abuse-mailbox'],
            range: whoisData.inetnum || whoisData.NetRange || whoisData.CIDR
        };
    } catch (error) {
        console.error(`Error getting WHOIS data for ${type} ${ip}:`, error);
        return {
            ip,
            type,
            error: `Failed to get hosting information for ${type}`
        };
    }
}

app.post('/api/lookup', async (req, res) => {
    try {
        const { domain } = req.body;
        
        // DNS records
        const records = {
            A: await dns.resolve(domain, 'A').catch(() => []),
            AAAA: await dns.resolve(domain, 'AAAA').catch(() => []),
            NS: await dns.resolve(domain, 'NS').catch(() => []),
            MX: await dns.resolve(domain, 'MX').catch(() => []),
            TXT: await dns.resolve(domain, 'TXT').catch(() => [])
        };
        
        // Get hosting information for all IP addresses
        const ipInfoPromises = [
            ...records.A.map(ip => getIpInfo(ip, 'IPv4')),
            ...records.AAAA.map(ip => getIpInfo(ip, 'IPv6'))
        ];
        
        const hostingInfo = await Promise.all(ipInfoPromises);
        
        // Group hosting info by IP version
        const groupedHostingInfo = {
            IPv4: hostingInfo.filter(info => info.type === 'IPv4'),
            IPv6: hostingInfo.filter(info => info.type === 'IPv6')
        };
        
        // Domain WHOIS information
        const domainWhois = await whois(domain);
        
        res.json({
            success: true,
            records,
            hostingInfo: groupedHostingInfo,
            domainWhois
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 