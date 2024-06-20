function getPartnerData(obj) {
    const myData = JSON.parse(localStorage.getItem('myData'));
    const partnerIndex = obj.participants.findIndex(participant => participant._id !== myData._id);

    if (partnerIndex === -1)    return [null, null, null];

    const partner = obj.participants[partnerIndex];
    const chatName = partner.name;
    const chatPhoto = partner.photo;
    const partnerId = partner._id;

    return [chatName, chatPhoto, partnerId];
}


export {
    getPartnerData
}