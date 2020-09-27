let Testania = new (function() {
    this.getABtestName = function() {
        let testaniaConfig = JSON.parse(localStorage.getItem('rest_get_get-flow'));

        return testaniaConfig && testaniaConfig.hasOwnProperty('flow_name')
            ? testaniaConfig.flow_name
            : 'Default';
    }
})();
