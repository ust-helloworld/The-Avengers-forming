describe('Test site.js', function() {
	
    //
    // Example: A test case of getRandomIntInclusive
    //
    it('value within 1 to 3', function() {
        var value = getRandomIntInclusive(1, 3);
        expect( value>=1 && value <= 3 ).toEqual(true);
    });

    //
    // Raymond's work
    //
    it('have firebase', function() {
        if (firebase.apps.length === 0)
        {
            initalizeFirebase();
        }
        expect( firebase ).toBeDefined();
    });

    it('testing value', function() {
        var test = getURLParameter('testing');
        expect( test ).toEqual(decodeURIComponent((new RegExp('[?|&]' + 'testing' + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null);
    });

    it('retrieve Firebase', function() {
        expect( retrieveOnceFirebase(firebase, "/", null) ).toBeUndefined();
    });

});