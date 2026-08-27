// B"H

window.AnimatorData = {
    CHARACTER_TEMPLATES: {
        'human_default': {
            baseHeight: 160,
            // Reference height in pixels for 1.0 scale
            palette: {
                skinColor: '#FCD9B6',
                skinDarkerColor: '#E0AF8C',
                hairColor: '#4A3B31',
                hairDarkerColor: '#3A2F29',
                pupilColor: '#333333',
                eyeWhiteColor: '#FFFFFF',
                mouthColor: '#C23A4B',
                shirtColor: '#5DADE2',
                sleeveColor: '@shirtColor',
                pantsColor: '#34495E',
                // Use @ to reference another key in *this* palette
                shoeColor: '#4A3B31',
                tzitzitColor: '#F5F5F5',
                outlineColor: '#2C3E50',
                yarmulkeColor: '@hairDarkerColor'
            },
            // Part definitions:
            // - id: Unique identifier for the part.
            // - parentId: ID of the parent part. null for root parts (like torso).
            // - anchorToParent: {x, y} fractional point on parent's bounding box (0,0 top-left, 1,1 bottom-right) to attach to.
            // - pivot: {x, y} fractional point on THIS part's bounding box (0,0 top-left, 0.5,0.5 center) for its own rotation/scaling.
            // - dimensions: { wFactor, hFactor } size relative to character's baseHeight.
            // - shape: { type, ...shape_specific_params like fill, pupilFill, color (for mouth/tzitzit line) }. Fill/stroke can be palette keys.
            // - zIndex: Drawing order relative to siblings under the same parent. Higher zIndex is in front.
            // - genderConditional: 'male', 'female', or null. Controls visibility based on character's gender flag.
            // - ikChain: Optional. For effector parts (e.g., hand), defines the 3-part chain [upperLimbId, lowerLimbId, thisPartId] for IK.
            // - attachedBehaviors: Array of behavior definitions for this part.
            parts: [// Torso is the root
            {
                id: 'torso',
                parentId: null,
                anchorToParent: {
                    x: 0.5,
                    y: 0.5
                },
                pivot: {
                    x: 0.5,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.3,
                    hFactor: 0.4
                },
                shape: {
                    type: 'rect',
                    fill: 'shirtColor'
                },
                zIndex: 0
            },
            // Head and its accessories
            {
                id: 'head',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.5,
                    y: 0.05
                },
                pivot: {
                    x: 0.5,
                    y: 0.8
                },
                dimensions: {
                    wFactor: 0.28,
                    hFactor: 0.33
                },
                shape: {
                    type: 'ellipse',
                    fill: 'skinColor'
                },
                zIndex: 5
            }, {
                id: 'yarmulke',
                parentId: 'head',
                anchorToParent: {
                    x: 0.5,
                    y: 0.08
                },
                pivot: {
                    x: 0.5,
                    y: 0.9
                },
                dimensions: {
                    wFactor: 0.15,
                    hFactor: 0.06
                },
                shape: {
                    type: 'ellipse',
                    fill: 'yarmulkeColor'
                },
                zIndex: 5.1,
                genderConditional: 'male'
            }, {
                id: 'eyeL',
                parentId: 'head',
                anchorToParent: {
                    x: 0.3,
                    y: 0.4
                },
                pivot: {
                    x: 0.5,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.07,
                    hFactor: 0.045
                },
                shape: {
                    type: 'eye',
                    fill: 'eyeWhiteColor',
                    pupilFill: 'pupilColor',
                    pupilSizeFactor: 0.025
                },
                zIndex: 6
            }, {
                id: 'eyeR',
                parentId: 'head',
                anchorToParent: {
                    x: 0.7,
                    y: 0.4
                },
                pivot: {
                    x: 0.5,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.07,
                    hFactor: 0.045
                },
                shape: {
                    type: 'eye',
                    fill: 'eyeWhiteColor',
                    pupilFill: 'pupilColor',
                    pupilSizeFactor: 0.025
                },
                zIndex: 6
            }, {
                id: 'mouth',
                parentId: 'head',
                anchorToParent: {
                    x: 0.5,
                    y: 0.75
                },
                pivot: {
                    x: 0.5,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.14,
                    hFactor: 0.06
                },
                shape: {
                    type: 'mouth',
                    color: 'mouthColor',
                    initialShape: 'neutral'
                },
                zIndex: 6
            },
            // Arms (Left side is character's left)
            {
                id: 'armUpperL',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.1,
                    y: 0.15
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.07,
                    hFactor: 0.25
                },
                shape: {
                    type: 'rect',
                    fill: 'sleeveColor'
                },
                zIndex: -1,
                ikChain: ['armUpperL', 'armLowerL', 'handL']
            }, {
                id: 'armLowerL',
                parentId: 'armUpperL',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.06,
                    hFactor: 0.22
                },
                shape: {
                    type: 'rect',
                    fill: 'sleeveColor'
                },
                zIndex: -1.1
            }, // Ensure zIndex doesn't conflict if parent also -1
            {
                id: 'handL',
                parentId: 'armLowerL',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.06,
                    hFactor: 0.06
                },
                shape: {
                    type: 'ellipse',
                    fill: 'skinColor'
                },
                zIndex: -1.2
            },
            // Arms (Right side)
            {
                id: 'armUpperR',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.9,
                    y: 0.15
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.07,
                    hFactor: 0.25
                },
                shape: {
                    type: 'rect',
                    fill: 'sleeveColor'
                },
                zIndex: 1,
                ikChain: ['armUpperR', 'armLowerR', 'handR']
            }, {
                id: 'armLowerR',
                parentId: 'armUpperR',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.06,
                    hFactor: 0.22
                },
                shape: {
                    type: 'rect',
                    fill: 'sleeveColor'
                },
                zIndex: 1.1
            }, {
                id: 'handR',
                parentId: 'armLowerR',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.06,
                    hFactor: 0.06
                },
                shape: {
                    type: 'ellipse',
                    fill: 'skinColor'
                },
                zIndex: 1.2
            },
            // Legs (Left side) - Note: Leg pivot at top for swing
            {
                id: 'legUpperL',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.3,
                    y: 0.98
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.09,
                    hFactor: 0.28
                },
                shape: {
                    type: 'rect',
                    fill: 'pantsColor'
                },
                zIndex: -2
            }, {
                id: 'legLowerL',
                parentId: 'legUpperL',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.08,
                    hFactor: 0.26
                },
                shape: {
                    type: 'rect',
                    fill: 'pantsColor'
                },
                zIndex: -2.1
            }, {
                id: 'footL',
                parentId: 'legLowerL',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.25,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.11,
                    hFactor: 0.05
                },
                shape: {
                    type: 'ellipse',
                    fill: 'shoeColor'
                },
                zIndex: -2.2
            }, // Pivot for foot rotation

            // Legs (Right side)
            {
                id: 'legUpperR',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.7,
                    y: 0.98
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.09,
                    hFactor: 0.28
                },
                shape: {
                    type: 'rect',
                    fill: 'pantsColor'
                },
                zIndex: -0.5
            }, // In front of left leg but behind torso
            {
                id: 'legLowerR',
                parentId: 'legUpperR',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.5,
                    y: 0.1
                },
                dimensions: {
                    wFactor: 0.08,
                    hFactor: 0.26
                },
                shape: {
                    type: 'rect',
                    fill: 'pantsColor'
                },
                zIndex: -0.4
            }, {
                id: 'footR',
                parentId: 'legLowerR',
                anchorToParent: {
                    x: 0.5,
                    y: 0.95
                },
                pivot: {
                    x: 0.25,
                    y: 0.5
                },
                dimensions: {
                    wFactor: 0.11,
                    hFactor: 0.05
                },
                shape: {
                    type: 'ellipse',
                    fill: 'shoeColor'
                },
                zIndex: -0.3
            },
            // Tzitzit
            {
                id: 'tzitzit_FL',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.25,
                    y: 0.9
                },
                pivot: {
                    x: 0.5,
                    y: 0
                },
                dimensions: {
                    wFactor: 0.02,
                    hFactor: 0.2
                },
                shape: {
                    type: 'tzitzit_strand',
                    numStrings: 2,
                    color: 'tzitzitColor'
                },
                zIndex: 2,
                genderConditional: 'male',
                attachedBehaviors: [{
                    type: 'simpleSpringPhysics',
                    stiffness: 0.2,
                    damping: 0.85,
                    gravityFactor: 1.5,
                    angleLimit: 40
                }]
            }, {
                id: 'tzitzit_FR',
                parentId: 'torso',
                anchorToParent: {
                    x: 0.75,
                    y: 0.9
                },
                pivot: {
                    x: 0.5,
                    y: 0
                },
                dimensions: {
                    wFactor: 0.02,
                    hFactor: 0.2
                },
                shape: {
                    type: 'tzitzit_strand',
                    numStrings: 2,
                    color: 'tzitzitColor'
                },
                zIndex: 2,
                genderConditional: 'male',
                attachedBehaviors: [{
                    type: 'simpleSpringPhysics',
                    stiffness: 0.2,
                    damping: 0.85,
                    gravityFactor: 1.5,
                    angleLimit: 40
                }]
            }, ],
            facingOverrides: {
                // "profile_left": Character is looking left on screen. THEIR right side is visible to camera.
                "profile_left": {
                    yarmulke: {
                        anchorToParent: {
                            x: 0.45
                        }
                    },
                    // Shift yarmulke with head view
                    head: {
                        anchorToParent: {
                            x: 0.45
                        }
                    },
                    // Shift head slightly back on torso
                    eyeL: {
                        visible: false
                    },
                    eyeR: {
                        anchorToParent: {
                            x: 0.35
                        }
                    },
                    // eyeR becomes the visible "front" eye
                    mouth: {
                        anchorToParent: {
                            x: 0.3
                        }
                    },
                    armUpperL: {
                        visible: false
                    },
                    armLowerL: {
                        visible: false
                    },
                    handL: {
                        visible: false
                    },
                    legUpperL: {
                        visible: false
                    },
                    legLowerL: {
                        visible: false
                    },
                    footL: {
                        visible: false
                    },
                    tzitzit_FL: {
                        visible: false
                    },
                    // Aliases for simplicity in poses - right side becomes "profile" side
                    armUpperR: {
                        idAlias: 'armUpper_profile',
                        zIndex: 1
                    },
                    armLowerR: {
                        idAlias: 'armLower_profile',
                        zIndex: 1.1
                    },
                    handR: {
                        idAlias: 'hand_profile',
                        zIndex: 1.2
                    },
                    legUpperR: {
                        idAlias: 'legUpper_profile',
                        zIndex: -0.5
                    },
                    legLowerR: {
                        idAlias: 'legLower_profile',
                        zIndex: -0.4
                    },
                    footR: {
                        idAlias: 'foot_profile',
                        zIndex: -0.3
                    },
                    tzitzit_FR: {
                        anchorToParent: {
                            x: 0.5
                        },
                        idAlias: 'tzitzit_profile',
                        zIndex: 2
                    },
                    // Center the visible tzitzit
                },
                // "profile_right": Character is looking right on screen. THEIR left side is visible.
                "profile_right": {
                    yarmulke: {
                        anchorToParent: {
                            x: 0.55
                        }
                    },
                    head: {
                        anchorToParent: {
                            x: 0.55
                        }
                    },
                    eyeR: {
                        visible: false
                    },
                    eyeL: {
                        anchorToParent: {
                            x: 0.65
                        }
                    },
                    mouth: {
                        anchorToParent: {
                            x: 0.7
                        }
                    },
                    armUpperR: {
                        visible: false
                    },
                    armLowerR: {
                        visible: false
                    },
                    handR: {
                        visible: false
                    },
                    legUpperR: {
                        visible: false
                    },
                    legLowerR: {
                        visible: false
                    },
                    footR: {
                        visible: false
                    },
                    tzitzit_FR: {
                        visible: false
                    },
                    armUpperL: {
                        idAlias: 'armUpper_profile',
                        zIndex: 1
                    },
                    armLowerL: {
                        idAlias: 'armLower_profile',
                        zIndex: 1.1
                    },
                    handL: {
                        idAlias: 'hand_profile',
                        zIndex: 1.2
                    },
                    legUpperL: {
                        idAlias: 'legUpper_profile',
                        zIndex: -0.5
                    },
                    legLowerL: {
                        idAlias: 'legLower_profile',
                        zIndex: -0.4
                    },
                    footL: {
                        idAlias: 'foot_profile',
                        zIndex: -0.3
                    },
                    tzitzit_FL: {
                        anchorToParent: {
                            x: 0.5
                        },
                        idAlias: 'tzitzit_profile',
                        zIndex: 2
                    },
                },
                "front": {
                    // Reset aliases and positions for front view
                    yarmulke: {
                        anchorToParent: {
                            x: 0.5
                        }
                    },
                    head: {
                        anchorToParent: {
                            x: 0.5
                        }
                    },
                    eyeL: {
                        anchorToParent: {
                            x: 0.3
                        },
                        visible: true
                    },
                    eyeR: {
                        anchorToParent: {
                            x: 0.7
                        },
                        visible: true
                    },
                    mouth: {
                        anchorToParent: {
                            x: 0.5
                        }
                    },
                    armUpperL: {
                        idAlias: null,
                        visible: true
                    },
                    armLowerL: {
                        idAlias: null,
                        visible: true
                    },
                    handL: {
                        idAlias: null,
                        visible: true
                    },
                    armUpperR: {
                        idAlias: null,
                        visible: true
                    },
                    armLowerR: {
                        idAlias: null,
                        visible: true
                    },
                    handR: {
                        idAlias: null,
                        visible: true
                    },
                    legUpperL: {
                        idAlias: null,
                        visible: true
                    },
                    legLowerL: {
                        idAlias: null,
                        visible: true
                    },
                    footL: {
                        idAlias: null,
                        visible: true
                    },
                    legUpperR: {
                        idAlias: null,
                        visible: true
                    },
                    legLowerR: {
                        idAlias: null,
                        visible: true
                    },
                    footR: {
                        idAlias: null,
                        visible: true
                    },
                    tzitzit_FL: {
                        anchorToParent: {
                            x: 0.25
                        },
                        idAlias: null,
                        visible: true
                    },
                    tzitzit_FR: {
                        anchorToParent: {
                            x: 0.75
                        },
                        idAlias: null,
                        visible: true
                    },
                }
            },
            defaultBehaviors: [ 
                { type: "blink", config: { intervalMin: 2200, intervalMax: 5500, duration: 0.16, targetPartIds: ['eyeL', 'eyeR'] } },
                { type: "eyeDart", config: { intervalMin: 2800, intervalMax: 6500, duration: 0.13, targetPartIds: ['eyeL', 'eyeR'], rangeFactor: 0.0025 } },
                // ***** NEW BEHAVIOR *****
                { type: "lipSync", config: { minChangeInterval: 0.08, maxChangeInterval: 0.20, targetPartIds: ["mouth"] } } 
            ]
        }
    },

    POSES: {
        'idle_default': {
            // Pose values are { xFactor: N, yFactor: N, rotation: degrees }
            // x/yFactor are offsets relative to character's baseHeight * character's size
            // rotation is in degrees
            // Can also include rootMotionYFactor for overall character bob, applied to torso or a specific part.
            torso: {
                rotation: (phase) => Math.sin(phase * 0.5) * 1,
                rootMotionYFactor: (phase) => Math.sin(phase * 0.6) * 0.006
            },
            head: {
                rotation: (phase) => Math.sin(phase * 0.7) * 2
            },
            armUpperL: {
                rotation: 10
            },
            armLowerL: {
                rotation: 10
            },
            armUpperR: {
                rotation: -10
            },
            armLowerR: {
                rotation: -10
            },
            armUpper_profile: {
                rotation: 5
            },
            armLower_profile: {
                rotation: 5
            },
            // For when arms are aliased in profile
            legUpperL: {
                rotation: 2
            },
            legLowerL: {
                rotation: -2
            },
            footL: {
                rotation: 0
            },
            legUpperR: {
                rotation: -2
            },
            legLowerR: {
                rotation: 2
            },
            footR: {
                rotation: 0
            },
            // Profile legs might just inherit, or be slightly different
            legUpper_profile: {
                rotation: 0
            },
            legLower_profile: {
                rotation: 0
            },
            foot_profile: {
                rotation: 0
            },
            speedFactor: 1.0 // Multiplier for phase progression
        },
        'walk': {
            rootMotionYFactor: (phase) => Math.abs(Math.sin(phase * 0.5)) * -0.015,
            // Body bobs down a bit
            torso: {
                rotation: (phase) => Math.sin(phase) * 2
            },
            head: {
                rotation: (phase) => Math.sin(phase) * -2.5
            },
            // Counter-rotate to torso
            // Arms swing (front view)
            armUpperL: {
                rotation: (phase) => 45 * Math.sin(phase)
            },
            armLowerL: {
                rotation: (phase) => 30 * Math.sin(phase) + 15
            },
            // Slightly bent forward
            armUpperR: {
                rotation: (phase) => -45 * Math.sin(phase)
            },
            armLowerR: {
                rotation: (phase) => -30 * Math.sin(phase) + 15
            },
            // Arms swing (profile view - aliased)
            armUpper_profile: {
                rotation: (phase) => 40 * Math.sin(phase)
            },
            // Could be same or different for profile
            armLower_profile: {
                rotation: (phase) => 25 * Math.sin(phase) + 10
            },
            // Legs swing (front view)
            legUpperL: {
                rotation: (phase) => -40 * Math.sin(phase)
            },
            legLowerL: {
                rotation: (phase) => 30 * Math.max(0, Math.cos(phase)) + 10
            },
            // Knee bend forward
            footL: {
                rotation: (phase) => 10 * Math.sin(phase)
            },
            legUpperR: {
                rotation: (phase) => 40 * Math.sin(phase)
            },
            legLowerR: {
                rotation: (phase) => 30 * Math.max(0, Math.cos(phase + Math.PI)) + 10
            },
            footR: {
                rotation: (phase) => -10 * Math.sin(phase)
            },
            // Legs swing (profile view - aliased)
            legUpper_profile: {
                rotation: (phase) => -35 * Math.sin(phase)
            },
            legLower_profile: {
                rotation: (phase) => 25 * Math.max(0, Math.cos(phase)) + 5
            },
            foot_profile: {
                rotation: (phase) => 5 * Math.sin(phase)
            },
            speedFactor: 1.8
        },
        'sit_simple': {
            torso: {
                rotation: -3,
                yFactor: -0.18
            },
            // Torso slightly back and lower, yFactor is relative to baseHeight
            head: {
                rotation: 3
            },
            armUpperL: {
                rotation: 30
            },
            armLowerL: {
                rotation: 40
            },
            armUpperR: {
                rotation: -30
            },
            armLowerR: {
                rotation: -40
            },
            armUpper_profile: {
                rotation: 35
            },
            armLower_profile: {
                rotation: 35
            },
            legUpperL: {
                rotation: -85
            },
            legLowerL: {
                rotation: 80
            },
            footL: {
                rotation: 5
            },
            legUpperR: {
                rotation: -85
            },
            legLowerR: {
                rotation: 80
            },
            footR: {
                rotation: 5
            },
            legUpper_profile: {
                rotation: -85
            },
            legLower_profile: {
                rotation: 80
            },
            foot_profile: {
                rotation: 5
            },
            speedFactor: 0.3 // Slower movements when sitting
        },
        'thinking_chin_touch': {
            // Example IK pose
            head: {
                rotation: -10
            },
            // Target for handR: right side of chin. IK will solve armR.
            // anchorFactor is {x,y} on the targetPart's bounding box.
            handR: {
                ikTarget: {
                    partId: 'head',
                    anchorFactor: {
                        x: 0.7,
                        y: 0.85
                    }
                },
                preferBendClockwise: false
            },
            // If in profile view where handR might be aliased to hand_profile:
            hand_profile: {
                ikTarget: {
                    partId: 'head',
                    anchorFactor: {
                        x: (charState) => charState.facingDirection === 'left' ? 0.3 : 0.7,
                        y: 0.85
                    }
                },
                preferBendClockwise: false
            },
            // Dynamic target based on facing
            armUpperL: {
                rotation: 15
            },
            armLowerL: {
                rotation: 10
            },
            // Other arm can be posed normally
            speedFactor: 0.5
        }
    },

    EXPRESSIONS: {
        'neutral': {
            eyeL: {
                openFactor: 1.0
            },
            eyeR: {
                openFactor: 1.0
            },
            mouth: {
                shapeKey: 'neutral'
            }
        },
        'happy': {
            eyeL: {
                openFactor: 0.85,
                pupilShiftYFactor: -0.05
            },
            eyeR: {
                openFactor: 0.85,
                pupilShiftYFactor: -0.05
            },
            mouth: {
                shapeKey: 'smile'
            }
        },
        // pupilShiftYFactor relative to eye height
        'surprised': {
            eyeL: {
                openFactor: 1.15
            },
            eyeR: {
                openFactor: 1.15
            },
            mouth: {
                shapeKey: 'o_large'
            }
        },
        'blink_half': {
            eyeL: {
                openFactor: 0.5
            },
            eyeR: {
                openFactor: 0.5
            }
        },
        'blink_closed': {
            eyeL: {
                openFactor: 0.05
            },
            eyeR: {
                openFactor: 0.05
            }
        }
    },

    MOUTH_SHAPES: { 
        'neutral': { path: [{ cmd: 'M', x: -0.5, y: 0 }, { cmd: 'L', x: 0.5, y: 0 }], openFactor: 0 },
        'smile': { path: [{ cmd: 'M', x: -0.5, y: -0.05 }, { cmd: 'Q', x1: 0, y1: 0.3, x: 0.5, y: -0.05 }], openFactor: 0.1 },
        'o_small': { type: 'ellipse', widthFactor: 0.5, heightFactor: 0.4, openFactor: 0.3 },
        'o_large': { type: 'ellipse', widthFactor: 0.7, heightFactor: 0.75, openFactor: 0.8 },
        'm_consonant': { path: [{ cmd: 'M', x: -0.4, y: 0 }, { cmd: 'L', x: 0.4, y: 0 }], openFactor: 0.02 },
        // Add a few more simple shapes for variety during speech if you like
        'ee_ih': { path: [{ cmd: 'M', x: -0.45, y: -0.02 }, { cmd: 'L', x: 0.45, y: -0.02 }], openFactor: 0.05 }, // Slightly open, flatter
        'ah_small': { type: 'ellipse', widthFactor: 0.6, heightFactor: 0.5, openFactor: 0.4 }
    },


    OBJECT_TEMPLATES: {
        'generic_box': {
            dimensions: {
                w: 50,
                h: 50
            },
            // Absolute pixels for base size
            shape: {
                type: 'rect',
                fill: '#A0A0A0',
                stroke: '#333333'
            },
            // Default lineWidth in renderer
            pivot: {
                x: 0.5,
                y: 0.5
            },
            // For object's own rotation
            grabbablePoints: [{
                id: 'center',
                x: 0.5,
                y: 0.5
            }]// Relative to object dimensions
        },
        'generic_ball': {
            dimensions: {
                w: 40,
                h: 40
            },
            shape: {
                type: 'ellipse',
                fill: '#D0A0A0',
                stroke: '#333333'
            },
            pivot: {
                x: 0.5,
                y: 0.5
            },
            grabbablePoints: [{
                id: 'center',
                x: 0.5,
                y: 0.5
            }]
        },
        'simple_cloud': {
            "id": "cloud_main",
            "dimensions": { "w": 150, "h": 60 }, // Overall bounding box
            "shape": { "type": "rect", "fill": "rgba(0,0,0,0)" }, // Invisible container
            "pivot": { "x": 0.5, "y": 0.5 },
            "children": [
                { "id": "puff1", "parentId": null, "anchorToParent": {"x":0.3, "y":0.5}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":0.5, "hFactor":0.7, "relativeTo":"parentDimensions"},
                  "shape": {"type":"ellipse", "fill":"#FFFFFF", "stroke":"#F0F0F0", "lineWidth": 2} },
                { "id": "puff2", "parentId": null, "anchorToParent": {"x":0.6, "y":0.4}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":0.6, "hFactor":0.8, "relativeTo":"parentDimensions"},
                  "shape": {"type":"ellipse", "fill":"#F5F5F5", "stroke":"#E8E8E8", "lineWidth": 2} },
                { "id": "puff3", "parentId": null, "anchorToParent": {"x":0.8, "y":0.6}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":0.4, "hFactor":0.6, "relativeTo":"parentDimensions"},
                  "shape": {"type":"ellipse", "fill":"#FEFEFE", "stroke":"#EFEFEF", "lineWidth": 2} }
            ]
        },
        
        'pine_tree': {
            "id": "tree_main",
            "dimensions": { "w": 60, "h": 150 },
            "shape": { "type": "rect", "fill": "rgba(0,0,0,0)" },
            "pivot": { "x": 0.5, "y": 0.95 }, // Pivot at base center
            "children": [
                { "id": "trunk", "parentId": null, "anchorToParent": {"x":0.5, "y":0.9}, "pivot": {"x":0.5, "y":1.0},
                  "dimensions": {"wFactor":0.15, "hFactor":0.8, "relativeTo":"parentDimensions"},
                  "shape": {"type":"rect", "fill":"#654321"} }, // Brown trunk
                { "id": "leaves1", "parentId": "trunk", "anchorToParent": {"x":0.5, "y":0.1}, "pivot": {"x":0.5, "y":0.8},
                  "dimensions": {"wFactor":1.5, "hFactor":0.5, "relativeTo":"grandparentDimensions"}, // Wider than trunk, relative to whole tree
                  "shape": {"type":"polygon", "points":[{"x":0.5, "y":0},{"x":0, "y":1},{"x":1, "y":1}], "fill":"#228B22"} }, // Dark green triangle
                { "id": "leaves2", "parentId": "trunk", "anchorToParent": {"x":0.5, "y":0.3}, "pivot": {"x":0.5, "y":0.8},
                  "dimensions": {"wFactor":1.2, "hFactor":0.4, "relativeTo":"grandparentDimensions"},
                  "shape": {"type":"polygon", "points":[{"x":0.5, "y":0},{"x":0, "y":1},{"x":1, "y":1}], "fill":"#006400"} },
                { "id": "leaves3", "parentId": "trunk", "anchorToParent": {"x":0.5, "y":0.5}, "pivot": {"x":0.5, "y":0.8},
                  "dimensions": {"wFactor":0.9, "hFactor":0.3, "relativeTo":"grandparentDimensions"},
                  "shape": {"type":"polygon", "points":[{"x":0.5, "y":0},{"x":0, "y":1},{"x":1, "y":1}], "fill":"#556B2F"} }
            ]
        },
        
        'deciduous_tree': {
            "id": "tree_main",
            "dimensions": { "w": 100, "h": 120 },
            "shape": { "type": "rect", "fill": "rgba(0,0,0,0)" },
            "pivot": { "x": 0.5, "y": 0.95 },
            "children": [
                { "id": "trunk", "parentId": null, "anchorToParent": {"x":0.5, "y":0.85}, "pivot": {"x":0.5, "y":1.0},
                  "dimensions": {"wFactor":0.2, "hFactor":0.7, "relativeTo":"parentDimensions"},
                  "shape": {"type":"rect", "fill":"#8B4513"} },
                { "id": "canopy", "parentId": "trunk", "anchorToParent": {"x":0.5, "y":0.1}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":1.0, "hFactor":0.6, "relativeTo":"grandparentDimensions"}, // Canopy relative to whole tree size
                  "shape": {"type":"ellipse", "fill":"#3CB371"} } // Medium sea green
            ]
        },
        
        'grassy_hill': {
            "dimensions": { "w": 300, "h": 100 },
            "shape": { "type": "path", "pathData": [ // Smooth curve for a hill
                {"cmd":"M", "x":-0.5, "y":0.5}, // Start bottom left (relative to center)
                {"cmd":"Q", "x1":0, "y1":-0.5, "x":0.5, "y":0.5} // Curve up and down to bottom right
              ], "stroke": "rgba(0,0,0,0)", "fill":"#90EE90" // Light green fill for the area under curve (if renderer supports fill for path)
                         // If not, make it an ellipse slightly squashed or a polygon
            },
             "pivot": { "x": 0.5, "y": 1.0 } // Pivot at bottom center
            // Better: Use a polygon for a filled hill shape
            // "shape": { "type":"polygon", "points": [
            //     {"x":0, "y":1}, {"x":0, "y":0.5}, {"x":0.1,"y":0.3}, {"x":0.3,"y":0.1}, {"x":0.5,"y":0},
            //     {"x":0.7,"y":0.1}, {"x":0.9,"y":0.3}, {"x":1,"y":0.5}, {"x":1,"y":1}
            //   ], "fill":"#90EE90", "stroke":"#66CDAA"
            // },
            // "pivot": { "x": 0.5, "y": 1.0 }
        },
        // For the grassy_hill, if your `path` renderer doesn't fill, it's better to use a polygon or a series of ellipses to make the shape.
        // For simplicity, I'll use a squashed ellipse for the hill itself, and a rect for the ground.
        
        'simple_hill_ellipse': {
            "dimensions": {"w":400, "h":150},
            "shape": {"type":"ellipse", "fill":"#8FBC8F"}, // DarkSeaGreen
            "pivot": {"x":0.5, "y":0.8} // Pivot lower part of ellipse
        },
        
        'mountain_peak': {
            "id": "mountain_main",
            "dimensions": { "w": 200, "h": 300 },
            "shape": { "type": "rect", "fill": "rgba(0,0,0,0)" },
            "pivot": { "x": 0.5, "y": 1.0 }, // Pivot at base center
            "children": [
                { "id": "base_rock", "parentId": null, "anchorToParent": {"x":0.5, "y":0.5}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":1.0, "hFactor":1.0, "relativeTo":"parentDimensions"},
                  "shape": {"type":"polygon", "points":[{"x":0.5, "y":0},{"x":0, "y":1},{"x":1, "y":1}], "fill":"#A9A9A9"} }, // Dark Gray
                { "id": "snow_cap", "parentId": "base_rock", "anchorToParent": {"x":0.5, "y":0.15}, "pivot": {"x":0.5, "y":0.5},
                  "dimensions": {"wFactor":0.6, "hFactor":0.3, "relativeTo":"parentDimensions"}, // Relative to base_rock
                  "shape": {"type":"polygon", "points":[{"x":0.5,"y":0},{"x":0.1,"y":0.8},{"x":0.3,"y":1},{"x":0.7,"y":1},{"x":0.9,"y":0.8}], "fill":"#FFFFFF"} } // White
            ]
        },
        
        'city_building_tall': {
            "dimensions": { "w": 70, "h": 250 },
            "shape": { "type": "rect", "fill": "#696969" }, // DimGray
            "pivot": { "x": 0.5, "y": 1.0 },
            // Could add "window" children here using small rects and a loop or many definitions
            "children": [
                {"id":"window_row1_1", "parentId":null, "anchorToParent":{"x":0.3, "y":0.1}, "pivot":{"x":0.5,"y":0.5},
                 "dimensions":{"wFactor":0.2, "hFactor":0.05, "relativeTo":"parentDimensions"}, "shape":{"type":"rect", "fill":"#FFFFE0"}},
                {"id":"window_row1_2", "parentId":null, "anchorToParent":{"x":0.7, "y":0.1}, "pivot":{"x":0.5,"y":0.5},
                 "dimensions":{"wFactor":0.2, "hFactor":0.05, "relativeTo":"parentDimensions"}, "shape":{"type":"rect", "fill":"#FFFFE0"}},
                // ... more windows
                 {"id":"roof_detail", "parentId":null, "anchorToParent":{"x":0.5, "y":0.01}, "pivot":{"x":0.5,"y":0.5},
                 "dimensions":{"wFactor":1.1, "hFactor":0.03, "relativeTo":"parentDimensions"}, "shape":{"type":"rect", "fill":"#505050"}}
            ]
        },
        
        'city_building_wide': {
            "dimensions": { "w": 120, "h": 150 },
            "shape": { "type": "rect", "fill": "#778899" }, // LightSlateGray
            "pivot": { "x": 0.5, "y": 1.0 }
            // Add window children similarly if desired
        }
    },

    // Behavior definitions can be functions that are called on update,
    // or objects that the core logic knows how to interpret.
    // For now, these are handlers that the core Animator calls.
    BEHAVIOR_HANDLERS: {// Implement blink, eyeDart, simpleSpringPhysics here (or they'll be in Animator.Utils.js and referenced)
    },

    SHAPE_RENDERERS: {// Implement rect, ellipse, eye, mouth, tzitzit_strand, line here (or in Animator.Utils.js)
    }
};
