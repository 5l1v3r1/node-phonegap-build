/*
 * Module dependencies.
 */

var build = require('../../lib/phonegap-build/build'),
    config = require('../../lib/common/config'),
    zip = require('../../lib/phonegap-build/create/zip'),
    path = require('path'),
    options;

/*
 * Specification for build.
 */

describe('build(options, callback)', function() {
    beforeEach(function() {
        options = {
            api: {
                put: function() {
                    // spy stub
                }
            },
            platforms: ['android']
        };
        spyOn(zip, 'compress');
        spyOn(zip, 'cleanup');
        spyOn(options.api, 'put');
        spyOn(config.local, 'load');
        spyOn(build, 'waitForComplete');
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            build(options, function(e) {});
        }).toThrow();
    });

    it('should require options.api', function() {
        expect(function() {
            options.api = undefined;
            build(options, function(e) {});
        }).toThrow();
    });

    it('should require options.platforms', function() {
        expect(function() {
            options.platforms = undefined;
            build(options, function(e) {});
        }).toThrow();
    });

    it('should not require callback', function() {
        expect(function() {
            build(options);
        }).not.toThrow();
    });

    it('should try to zip application', function(done) {
        build(options, function(e) {});
        process.nextTick(function() {
            expect(zip.compress).toHaveBeenCalledWith(
                path.join(process.cwd(), 'www'),   // path to zip
                path.join(process.cwd(), 'build'), // path to write zip file
                jasmine.any(Function)
            );
            done();
        });
    });

    describe('successful zip', function() {
        beforeEach(function() {
            zip.compress.andCallFake(function(wwwPath, buildPath, callback) {
                callback(null, '/path/to/build/www.zip');
            });

            config.local.load.andCallFake(function(callback) {
                callback(null, {
                    'phonegap-build': {
                        'id': 12345
                    }
                });
            });
        });

        it('should try to upload app to phonegap build', function(done) {
            build(options, function(e) {});
            process.nextTick(function() {
                expect(options.api.put).toHaveBeenCalledWith(
                    '/apps/12345',
                    { form: { file: '/path/to/build/www.zip' } },
                    jasmine.any(Function)
                );
                done();
            });
        });

        describe('successful upload', function() {
            beforeEach(function() {
                options.api.put.andCallFake(function(path, headers, callback) {
                    callback(null, {});
                });
            });

            it('should delete zip archive', function(done) {
                build(options, function(e) {});
                process.nextTick(function() {
                    expect(zip.cleanup).toHaveBeenCalled();
                    done();
                });
            });

            it('should wait for the platform build to complete', function(done) {
                build(options, function(e) {});
                process.nextTick(function() {
                    expect(build.waitForComplete).toHaveBeenCalled();
                    done();
                });
            });

            describe('on build complete', function() {
                beforeEach(function() {
                    build.waitForComplete.andCallFake(function(options, callback) {
                        callback(null);
                    });
                });

                it('should trigger callback without an error', function(done) {
                    build(options, function(e) {
                        expect(e).toBeNull();
                        done();
                    });
                });

                it('should trigger "complete" event', function(done) {
                    var emitter = build(options);
                    emitter.on('complete', function(e) {
                        done();
                    });
                });
            });

            describe('on build error', function() {
                beforeEach(function() {
                    build.waitForComplete.andCallFake(function(options, callback) {
                        callback(new Error('some message'));
                    });
                });

                it('should trigger callback without an error', function(done) {
                    build(options, function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });

                it('should trigger "error" event', function(done) {
                    var emitter = build(options);
                    emitter.on('error', function(e) {
                        expect(e).toEqual(jasmine.any(Error));
                        done();
                    });
                });
            });
        });

        describe('failed upload', function() {
            beforeEach(function() {
                options.api.put.andCallFake(function(path, headers, callback) {
                    callback(new Error('Server did not respond'));
                });
            });

            it('should delete zip archive', function(done) {
                build(options, function(e) {});
                process.nextTick(function() {
                    expect(zip.cleanup).toHaveBeenCalled();
                    done();
                });
            });

            it('should trigger callback with an error', function(done) {
                build(options, function(e) {
                    expect(e).toEqual(jasmine.any(Error));
                    done();
                });
            });

            it('should trigger "error" event', function(done) {
                var emitter = build(options);
                emitter.on('error', function(e) {
                    expect(e).toEqual(jasmine.any(Error));
                    done();
                });
            });
        });
    });
});

/*
 * Specification for build.waitForComplete(options, callback);
 */

describe('build.waitForComplete', function() {
    beforeEach(function() {
        options = {
            api: {
                get: function() {
                    // spy stub
                }
            },
            id: 12345,
            platforms: ['android']
        };
        spyOn(options.api, 'get');
    });

    it('should require options parameter', function() {
        expect(function() {
            options = undefined;
            build.waitForComplete(options, function(e) {});
        }).toThrow();
    });

    it('should require options.api parameter', function() {
        expect(function() {
            options.api = undefined;
            build.waitForComplete(options, function(e) {});
        }).toThrow();
    });

    it('should require options.id parameter', function() {
        expect(function() {
            options.id = undefined;
            build.waitForComplete(options, function(e) {});
        }).toThrow();
    });

    it('should require options.platforms parameter', function() {
        expect(function() {
            options.platforms = undefined;
            build.waitForComplete(options, function(e) {});
        }).toThrow();
    });

    it('should require options.platforms parameter', function() {
        expect(function() {
            build.waitForComplete(options);
        }).toThrow();
    });

    it('should try to get application status', function() {
        build.waitForComplete(options, function(e) {});
        expect(options.api.get).toHaveBeenCalled();
    });
});
