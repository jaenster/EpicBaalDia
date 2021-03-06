Config.FieldID = true;

var Settings = {
    BoFailTimer: 9, // 9 seconds
    BaalPortalWait: 90, // Wait 45 seconds for a portal, otherwise it failed
    DiabloPortalWait: 30, // Wait 30 seconds for a portal, otherwise it failed,

};

var Msg = {action: "", ping: 0, pong: 0, y: 0, area: 0, seed: ''};

var Team = {
    // General class type
    RoleType: {
        all: (1 | 2 | 4 | 8 | 16 | 32 | 64 | 128),
        Trapsin: 1,
        Warcry: 2,
        JavaZon: 4,
        CurseNecro: 8,
        EleDruid: 16,
        Blizzy: 32,
        Hammerdin: 64,
        LightSorc: 128,
        Smiter: 256
    },
    myRoleType: 0,

    // Baal
    BaalType: {all: (1 | 2), Tele: 1, Helper: 2},
    myBaalType: 0,

    // Nihlathak
    NihlathakType: {all: (1 | 2), Tele: 1, Helper: 2},
    myNihlathakType: 0,

    // Diablo
    DiabloType: {all: (1 | 2), Tele: 1, Helper: 2},
    myDiabloType: 0,
    DiabloFast: true,
    DiabloUseTeleport: true,

    // Mephisto
    MephistoType: {all: (1 | 2), Tele: 1, Helper: 2},
    myMephistoType: 0,

    // Weak
    isWeak: false,

    // Which runs we do
    Baal: false,
    Diablo: false,
    Nihlathak: false,
    Mephisto: true,

    // do baal first?
    baalFirst: false,

    // Special for tele'ers
    DontCastTp: false,
    DontCastTpReason: '',

    othersProfile: [],
    othersInGame: [],
    others: {
        settings: {},
        profile: [],
        inGame: []
    },
    Leader: Config.Leader,
    LongestIngameTick: 0,
    isLeader: (Config.Leader === ''), // A leader doesn't have a leader
    updateTime: false,

    msgTypes: {
        ping: 101,
        pong: 102,
        config: 103,
        syncDone: 104,
        syncDoneBefore: 105,
        syncStart: 106,
        quitSync: 107,
        getLocation: 108,
        Location: 109,
        stopFollow: 110,
        TpSafeQuestion: 111,
        TpSafe: 112,
        action: 100
    },
    DoneSyncs: [],

    updateOthers: function () {
        this.getParty = function () {
            var i,
                party = getParty();

            for (i = 0; i < 3 && !party; i += 1) {
                delay(me.ping * 2 + 500);
                party = getParty();
            }
            return party;
        };
        this.updateTime = false;
        var i, filename, party, string, profilename, obj,
            fileList = dopen("data/").getFiles();

        this.othersProfile = [];
        this.othersInGame = [];
        //print(fileList.toString());

        // Loop trough all files in data/
        for (i = 0; i < fileList.length; i += 1) {
            filename = 'data/' + fileList[i].substring(0, fileList[i].indexOf(".json")) + '.json';
            string = Misc.fileAction(filename, 0);
            //print('ProfileName:' + filename);
            // get party
            if (!string) {
                continue;
            }
            party = getParty();
            obj = JSON.parse(string);
            if (obj && obj.hasOwnProperty("name")) {
                print(obj.name);
                if (party) {
                    do {
                        // This profile in my game?
                        if (party.name === obj.name) {
                            // Same name, so a char that is running with us
                            this.othersProfile.push(fileList[i].substring(0, fileList[i].indexOf(".json")));
                            this.othersInGame.push(party.name);
                        }
                    } while (party.getNext());
                }
            }
        }
        /*
        print('others: ' + this.othersInGame.toString());
        print('othersProfile: ' + this.othersProfile.toString());
        print('Leader: ' + this.Leader);*/
    },
    init: function () {

        // Move a bit, to avoid a boxed char in the middle that cant move
        Pather.walkTo(me.x + rand(-5, 5), me.y + rand(-5, 5));

        this.myRoleType = 0;


        /*
        // Kind of role
        switch (true) {
            case Config.XPRun.Char.type === 'Trapsin':
                this.myRoleType = this.RoleType.Trapsin;
                break;
            case Config.XPRun.Char.type === 'Warcry':
                this.myRoleType = this.RoleType.Warcry;
                break;
            case Config.XPRun.Char.type === 'Javazon':
                this.myRoleType = this.RoleType.JavaZon;
                break;
            case Config.XPRun.Char.type === 'Curse':
                this.myRoleType = this.RoleType.CurseNecro;
                break;
            case Config.XPRun.Char.type === 'Eledruid':
                this.myRoleType = this.RoleType.EleDruid;
                break;
            case Config.XPRun.Char.type === 'Hammerdin':
                this.myRoleType = this.RoleType.Hammerdin;
                break;
            case Config.XPRun.Char.type === 'Blizzy':
                this.myRoleType = this.RoleType.Blizzy;
                break;
            case Config.XPRun.Char.type === 'Lightsorc':
                this.myRoleType = this.RoleType.LightSorc;
                break;
            case Config.XPRun.Char.type === 'Smiter':
                this.myRoleType = this.RoleType.Smiter;
                break
        } */

        Util.autoConfig();

        // Baal role
        switch (true) {
            case Config.XPRun.Baal.type === 'Tele':
                this.myBaalType = this.BaalType.Tele;
                break;
            case Config.XPRun.Baal.type === 'Helper':
                this.myBaalType = this.BaalType.Helper;
                break;
        }
        print('My BaalType:' + this.myBaalType);


        // Nihlathak Role
        switch (true) {
            case Config.XPRun.Nihlathak.type === 'Tele':
                this.myNihlathakType = this.NihlathakType.Tele;
                break;
            case Config.XPRun.Nihlathak.type === 'Helper':
                this.myNihlathakType = this.NihlathakType.Helper;
                break;
        }

        // Diablo Role
        switch (true) {
            case Config.XPRun.Diablo.type === 'Helper':
                this.myDiabloType = this.DiabloType.Helper;
                break;
            case Config.XPRun.Diablo.type === 'Tele':
                this.myDiabloType = this.DiabloType.Tele;
                break;
        }
        // Mephisto Role
        switch (true) {
            case Config.XPRun.Mephisto.type === 'Helper':
                this.myMephistoType = this.MephistoType.Helper;
                break;
            case Config.XPRun.Mephisto.type === 'Tele':
                this.myMephistoType = this.MephistoType.Tele;
                break;
        }

        // isWeak ?

        // Set isWeak on true if: Avg of res is lower as zero, or if it is set in the config
        this.isWeak = (Util.resistanceAvg() < 0 || Config.XPRun.Char.weak);
        print('Am i weak? :' + this.isWeak);

        // Runs we run
        this.Baal = Config.XPRun.Baal.do;
        this.Nihlathak = Config.XPRun.Nihlathak.do;
        this.Diablo = Config.XPRun.Diablo.do;
        this.Mephisto = Config.XPRun.Mephisto.do;

        // Specific run settings
        this.DiabloFast = Config.XPRun.Diablo.fast;


        // Want baal first? Or are we only doing a baalrun?
        if ((Config.XPRun.baalFirst || (this.Baal && !this.Diablo))
            && this.Baal) {
            this.baalFirst = true;
        }
        this.updateOthers();

        if (!this.isLeader) {
            //this.sendMsgLeader(JSON.stringify(Config.XPRun), this.msgTypes.config); // Send my data
        } else {
            print('Im the leader');
        }


        //this.sync('start');
    },
    usePortal: function (area) {
        this.takeTP = function () {
            var i;
            // If we not allowed to cast a town portal, cuz somewhere we have a town portal standing.
            // take the town portal of someone else
            if (this.DontCastTp) {
                for (i = 0; i < 5; i += 1) {
                    delay(250);
                    if (Pather.getPortal(area, null) && Pather.usePortal(area, null)) {
                        return true;
                    }
                }
            } else {
                // Enough portals already. Just take one of the others.
                for (i = 0; i < 5; i += 1) {
                    if (Pather.getPortal(area, null) && Pather.usePortal(area, null)) {
                        return true;
                    }
                    delay(rand(me.ping, me.ping * 5));
                }
                // No one casted a portal yet, guess we just have to make one
                if (Pather.makePortal() && Pather.usePortal(area, null)) {
                    return true
                }
            }
            return false;
        };
        var i;
        for (i = 0; me.area !== area || i < 5; i += 1) {
            if (this.takeTP(area)) {
                return true;
            }
            delay(100);
        }
        return false;

    },
    waitUpdatedPortal: function (area, who, use) {
        Town.goToTown();
        Town.moveToSpot('portal');
        var portal1, portal2, i = 0;
        while (i === 30) {
            portal1 = Pather.getPortal(area, who);
            delay(1000);
            portal2 = Pather.getPortal(area, who);
            // Id changed?
            if (portal1.gid !== portal2.gid) {
                if (use) {
                    Pather.usePortal(area, who);
                }
                return true
            }
            i = 0;
        }
        return false
    },

    sendMsgLeader: function (action, mode) {
        var i;
        if (mode === undefined) {
            mode = 100; // Regular msg
        }

        for (i = 0; i < this.othersInGame.length; i += 1) {
            if (this.othersInGame[i] === this.Leader) {
                sendCopyData(null, this.othersProfile[i], mode, action);
            }
        }
    },
    sendMsg: function (action, mode) {
        var i;
        if (mode === undefined) {
            mode = 100; // Regular msg
        }

        // Broadcast to all
        for (i = 0; i < this.othersProfile.length; i += 1) {
            sendCopyData(null, this.othersProfile[i], mode, action);
        }
        return true;
    },


    // Modified after i stolen this from Autosmurf. https://github.com/JeanMax/AutoSmurf
    sync: function (seed, timeout) {
        var save,
            sleepdelay = 25, // miliseconds
            pingevery = 250; // miliseconds

        if (!seed) {
            seed = "seed";
        }
        if (!timeout) {
            timeout = 15; // 5 seconds
        }
        timeout *= (1000 / sleepdelay);
        print("sync -- " + seed);

        Msg.seed = seed;
        if (this.isLeader) {

            Msg.ping = 0;
            while (timeout && Msg.ping !== this.othersProfile.length - 1) {

                if (Msg.ping > this.othersProfile.length) {
                    save = Msg.ping;
                }
                // Reset ping.
                Msg.ping = 0;
                this.sendMsg(seed, this.msgTypes.ping);
                delay(sleepdelay);
                timeout -= 1;
                // Wait for everyone to reply
                while (timeout && Msg.ping !== this.othersProfile.length - 1 && timeout % (pingevery / sleepdelay)) {
                    if (this.updateTime) {
                        this.updateOthers();
                        break;
                    }
                    delay(sleepdelay);
                    timeout -= 1;
                }
                print('Got ' + Msg.ping + ' -- out of ' + (this.othersProfile.length - 1));

            }

            // Let the others know we are done
            if (timeout) {
                this.sendMsg(seed, this.msgTypes.syncDone);
            }

        } else {
            Msg.pong = 1; //ready to pong
            while (timeout && Msg.seed !== '') {
                delay(sleepdelay);
                timeout -= 1;
            }
            Msg.pong = 0;
        }
        print('sync done -- ' + seed);

        return !!timeout;
    },


};

var Area = {

    // Act 3
    KurastDocktown: 75,
    DuranceOfHateLevel2: 101,
    DuranceOfHateLevel3: 102,


    // act 4
    PandemoniumFortress: 103,
    RiverOfFlame: 107,
    ChoasSanctuary: 108,

    // act 5
    Harrogath: 109,
    HallsOfAnguish: 122,
    HallsOfPain: 123,
    HallsOfVaught: 124,
    WorldstoneLvl2: 129,
    WorldstoneLvl3: 130,
    ThroneOfDestruction: 131,
    WorldstoneChamber: 132

};

var Presets = {
    BaalPortalSpot: [15118, 5002],
    BaalLeftSide: [15072, 5026],
    BaalWaveSpawn: [15093, 5029],
    BaalDefault: [15094, 5038],
    BaalBarb: [15092, 5011],

    skill: {
        None: -1,
        NormalAttack: 0,

        // Ama
        ChargedStrike: 24,
        LightningFury: 35,
        LightningStrike: 34,
        SlowMissiles: 17,

        // Sorc
        StaticField: 42,
        IceBlast: 45,
        Lightning: 49,
        ChainLightning: 53,
        EnergyShield: 58,
        Blizzard: 59,

        // Necro
        SkeletonMastery: 69,
        CorpseExplosion: 74,
        PoisonExplosion: 83,
        BoneSpear: 84,
        Decrepify: 87,
        LowerResist: 91,
        BoneSpirit: 93,
        FireGolem: 94,
        ClayGolem: 75,
        BloodGolem: 85,

        // Paladin

        Smite: 97,
        HolyBolt: 101,
        HolyShield: 117,
        Fanaticism: 122,
        BlessedHammer: 112,
        Concentration: 113,

        // Barb
        Bash: 126,
        Stun: 139,
        Concentrate: 144,
        Whirlwind: 151,
        Berserk: 152,
        WarCry: 154,
        Frenzy: 147,

        // Druid
        Twister: 240,
        Tornado: 245,
        PoisonCreeper: 222,
        CarrionVine: 231,
        SolarCreeper: 241,
        SpiritWolf: 227,
        DireWolf: 237,
        Grizzly: 247,


        // Assasin
        FireBlast: 251,
        ShockField: 256,
        CloakOfShadows: 264,
        Fade: 267,
        LightningSentry: 271,
        MindBlast: 273,
        DeathSentry: 276,

    }


};

var Util = {
    startFollow: function () {
        print("startFollow");


        this.getLeaderUnit = function () {
            var player = getUnit(0, Team.Leader);

            if (player) {
                do {
                    if (!player.dead) {
                        return player;
                    }
                } while (player.getNext());
            }

            return false;
        };

        var i,
            leader = false;

        Msg.x = 0;
        Msg.y = 0;
        Msg.area = 0;
        // Leader doesn't follow leader
        if (Team.isLeader) {
            Msg.action = "";
            return;
        }
        Msg.action = "following";

        while (Msg.action !== "stop") {
            for (i = 0; i < 3 && (!leader || !copyUnit(leader).x); i += 1) {
                leader = this.getLeaderUnit();
                delay(me.ping + 100);
            }
            if (i === 3) {
                Team.sendMsg("follow", Team.msgTypes.getLocation);
                delay(200);
            } else {
                Msg.x = leader.targetx;
                Msg.y = leader.targety;
                Msg.area = leader.area;
            }
            //print('MoveTo x:'+Msg.x+'y:'+Msg.y);
            if (Msg.x && Msg.y && Msg.area && me.area && Msg.area === me.area) {
                Pather.moveTo(Msg.x + rand(-10, 10), Msg.y + rand(-10, 10), undefined, undefined, true);
            }
            XPRunAttack.clear(10);
            delay(250);
        }

        return true;
    },
    resistanceAvg: function () {
        return (me.getStat(45) + me.getStat(43) + me.getStat(41) + me.getStat(39)) / 4
    },
    stopFollow: function () {
        print("stopFollow");
        Msg.action = "stop";
        if (Team.isLeader) {
            Team.sendMsg('', Team.msgTypes.stopFollow);
        }
    },
    fastAct4to5: function () {
        if (me.area > Area.Harrogath) {
            Town.goToTown();
            return true;
        }
        Town.goToTown(4);
        Pather.moveTo(5034, 5022);
        Pather.moveTo(5022, 5019);
        var npc;
        //Town.move("tyrael");
        npc = getUnit(1, "tyrael");

        if (!npc || !npc.openMenu()) {
            return false;
        }

        delay(me.ping + 1);

        if (getUnit(2, 566)) {
            me.cancel();
            Pather.useUnit(2, 566, 109);
        } else {
            Misc.useMenu(0x58D2);
        }
        return true;
    },

    autoConfig: function () {
        this.printAttack = function () {
            var i, j,
                name = ['preattack', 'Boss untimed', 'Boss timed', 'Normal untimed', 'Normal timed', 'Immune untimed', 'Immune timed'],
                string = 'Attack layout:\n\r';
            for (i = 0; i < Config.AttackSkill.length; i += 1) {
                for (j in Presets.skill) {
                    if (Presets.hasOwnProperty(j) && typeof j === "string") {
                        if (Config.AttackSkill[i] === Presets.skill[j]) {
                            string += 'Config.AttackSkill[' + i + '] = ' + name[i] + '\n\r';
                        }
                    }
                }
            }
            acPrint(string);
        };
        this.getIronGolem = function () {
            var owner,
                golem = getUnit(1, 291);

            if (golem) {
                do {
                    owner = golem.getParent();

                    if (owner && owner.name === me.name) {
                        return copyUnit(golem);
                    }
                } while (golem.getNext());
            }

            return false;
        };
        this.bestSkill = function (skills, defaultSk) {

            var max = 0,
                theSkill = defaultSk === undefined ? -1 : defaultSk;

            for (i = 0; i < skills.length; i += 1) {
                if (getSk(skills[i]) > max) {
                    theSkill = skills[i];
                    max = getSk(skills[i]);
                }
            }
            return theSkill;
        };
        this.emptyInventorySlots = function () {
            var i, j, free = 0;
            for (i = 0; i < 4; i += 1) {
                for (j = 0; j < Config.Inventory[i].length; j += 1) {
                    free += 1;
                }
            }
            return free;
        };
        this.dodgeRules = function () {
            Config.Dodge = true; // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
            Config.DodgeRange = 7; // Distance to keep from monsters.
            Config.DodgeHP = 100; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
        };
        var i, skill,
            getSk = function (number) {
                return me.getSkill(number, 1);
            },
            acPrint = function (what) {
                Util.print(what, 'AutoConfig:');
            },
            classes = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"];

        // Town settings
        acPrint('Starting..');
        Config.HealHP = 50;
        Config.HealMP = 50;
        Config.HealStatus = false;
        Config.UseMerc = true;
        Config.MercWatch = true;
        Config.AvoidDolls = ([0, 1, 2, 6].indexOf(me.classid)); // Avoid dolls in case your a Ama / Sorc / Necro or Assa

        // Potion settings
        Config.UseHP = 75;
        Config.UseRejuvHP = 45;
        Config.UseMP = 30;
        Config.UseRejuvMP = getSk(Presets.skill.EnergyShield) > 1 ? 25 : 0; // Only use a Rejuv pot for mana in case we have an es
        Config.UseMercHP = 75;
        Config.UseMercRejuv = 20;
        Config.HPBuffer = 0;
        Config.MPBuffer = 0;
        Config.RejuvBuffer = Math.min(Team.isWeak ? 6 : 3, Math.max(0, Math.floor(this.emptyInventorySlots() - 12 / 2))); // If space allows it, keep 3 Rejuv's in inventory or 6 in the case we are weak

        // Chicken settings
        Config.LifeChicken = 35; // Exit game if life is less or equal to designated percent.
        Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
        Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
        Config.TownHP = 0; // Go to town if life is under designated percent.
        Config.TownMP = 0; // Go to town if mana is under designated percent.

        Config.StashGold = 100000; // Minimum amount of gold to stash.

        for (i = 0; i < 4; i += 1) {
            Config.MinColumn[i] = Config.BeltColumn[i] !== 'rv' ? 3 : 0;
        }

        // Item identification settings
        Config.CainID.Enable = me.act === 4; // Only if we start in act4. Its quicker, otherwise it ain't.
        Config.CainID.MinGold = 2500000;
        Config.CainID.MinUnids = 3;
        Config.FieldID = true;
        Config.DroppedItemsAnnounce.Enable = false;
        Config.DroppedItemsAnnounce.Quality = [];

        // Repair settings
        Config.CubeRepair = false;
        Config.RepairPercent = 40;


        // Get type of char

        switch (classes[me.classid]) {
            case 'Amazon':
                skill = getSk(Presets.skill.ChargedStrike) + getSk(Presets.skill.LightningFury);
                if (skill > 38) {
                    Team.myRoleType = Team.RoleType.JavaZon;
                }
                break;
            case 'Sorceress':
                var light = getSk(Presets.skill.ChainLightning) + getSk(Presets.skill.Lightning),
                    blizz = getSk(Presets.skill.Blizzard) + getSk(Presets.skill.IceBlast)

                switch (true) {
                    case light > blizz && light > 38:
                        Team.myRoleType = Team.RoleType.LightSorc;
                        break;
                    case light < blizz && blizz > 38:
                        Team.myRoleType = Team.RoleType.Blizzy;
                        break;
                }

                this.dodgeRules(); // Sorcs are dodging

                // Class specific config
                Config.CastStatic = 60; // Cast static until the target is at designated life percent. 100 = disabled.
                Config.StaticList = ["Baal", 'Mephisto', 'Diablo', 571, 572, 573]; // List of monster NAMES or CLASSIDS to static. Example: Config.StaticList = ["Andariel", 243];
                break;
            case 'Necromancer':
                skill = getSk(Presets.skill.LowerResist);
                if (skill > 1) {
                    Team.myRoleType = Team.RoleType.CurseNecro;
                }
                break;
            case 'Paladin':
                var hammers = getSk(Presets.skill.Concentration) + getSk(Presets.skill.BlessedHammer),
                    smiting = getSk(Presets.skill.HolyShield) + getSk(Presets.skill.Fanaticism);
                switch (true) {
                    case hammers > smiting && hammers > 38:
                        Team.myRoleType = Team.RoleType.Hammerdin;
                        break;
                    case hammers < smiting && smiting > 38:
                        Team.myRoleType = Team.RoleType.Smiter;
                        break;
                }

                Config.AvoidDolls = Team.myRoleType === Team.RoleType.Hammerdin;
                Config.Vigor = true;
                Config.Charge = true;
                Config.Redemption = [50, 50];
                break;
            case 'Barbarian':
                skill = getSk(Presets.skill.WarCry);
                if (skill > 1) {
                    Team.myRoleType = Team.RoleType.Warcry;
                }
                break;
            case 'Druid':
                skill = getSk(Presets.skill.Tornado) + getSk(Presets.skill.Twister);
                if (skill > 38) {
                    Team.myRoleType = Team.RoleType.EleDruid;
                }
                break;
            case 'Assassin':
                skill = getSk(Presets.skill.LightningSentry) + getSk(Presets.skill.DeathSentry);
                if (skill > 38) {
                    Team.myRoleType = Team.RoleType.Trapsin;
                    this.dodgeRules(); // A trapsin is a casting char, aka dodge
                }
                break;
        }


        Config.BossPriority = true;
        Config.ClearType = 0xF;
        Config.TeleStomp = [1, 6].indexOf(me.classid); // Tele stomp only matters with a sorc or assa

        switch (Team.myRoleType) {
            case Team.RoleType.Trapsin:
                // Attacking, Shockfield for everyone, if imumn use FireBlast. Cast Mindblast on boss's
                Config.AttackSkill = [-1, Presets.skill.ShockField, Presets.skill.MindBlast, Presets.skill.ShockField, -1, Presets.skill.FireBlast, -1];

                Config.UseTraps = true;
                Config.Traps = [Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.DeathSentry];
                Config.BossTraps = [Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.LightningSentry, Presets.skill.LightningSentry];

                Config.SummonShadow = "Warrior"; // Master can cast MindBlast, we dont want that @ baalwaves
                Config.UseFade = this.resistanceAvg() < 45 && getSk(Presets.skill.Fade) !== 0; // Use fade if our avg res is less as 50 and we have the skill
                Config.UseBoS = !Config.useFade; // Use BoS if we dont use Fade
                acPrint('Using ' + Config.useFade ? 'Fade' : 'BoS');
                Config.UseVenom = false;
                Config.UseCloakofShadows = getSk(Presets.skill.CloakOfShadows); // Only if we have it
                break;
            case Team.RoleType.Warcry: // ToDo: See if switch have more + skills

                // Calculate the best skill for a barb, nothing found? Use "NormalAttack"
                var barbSkill = this.bestSkill([Presets.skill.Frenzy, Presets.skill.Whirlwind, Presets.skill.Berserk, Presets.skill.Concentrate, Presets.skill.Bash, Presets.skill.Stun], Presets.skill.NormalAttack);

                // Attacking, Always start with warcry, so we can stun mobs. After that, use the selected barbskill (skill with the most points)
                Config.AttackSkill = [Presets.skill.WarCry, barbSkill, -1, barbSkill, -1, -1, -1];


                Config.BOSwitch = 1;     // Every self respecting barb have something on switch
                Config.FindItem = false; // Asuming we have an Corpse Necro or Trapsin with Deathsentry, we don't want this.
                Config.FindItemSwitch = 0;
                break;
            case Team.RoleType.JavaZon: // ToDo: Check if we have Thunderstroke or Titans (due to selfrepair, we can spam or not spam lighting fury)

                // Attacking, always start with Lighting Strike since it cast a powerfull chain lighting to clear the area. After that pure Charged strike with some lighting strike in between
                Config.AttackSkill = [Presets.skill.LightningStrike, Presets.skill.ChargedStrike, Presets.skill.LightningStrike, Presets.skill.ChargedStrike, Presets.skill.LightningStrike, -1, -1];

                Config.LightningFuryDelay = 3; // Lightning fury interval in seconds. LF is treated as timed skill.
                Config.SummonValkyrie = true; // Summon Valkyrie

                break;
            case Team.RoleType.CurseNecro:
                // We are a curse Necro, however, what kind of necro we are?
                var necroSkillUntimed = this.bestSkill([Presets.skill.BoneSpear]), // Bonespear or nothing
                    necroSkillTimed = this.bestSkill([Presets.skill.BoneSpirit]), // Bonespirit or nothing
                    activeSummoner = getSk(Presets.skill.BoneSpirit) * 2 < getSk(Presets.skill.SkeletonMastery);                    // Is our skeleton mastery twice as high as our bonespirit? Ifso we are an active summoner

                if (activeSummoner) {
                    acPrint('Active summoner');
                    necroSkillUntimed = necroSkillTimed; // If we found bonespear, move it to timed
                    necroSkillTimed = 500; // Pure summoner
                    Config.Skeletons = "max";
                    Config.SkeletonMages = "max";
                    Config.Revives = "max";
                } else {
                    Config.Skeletons = 0;
                    Config.SkeletonMages = 0;
                    Config.Revives = 0;
                }

                // Attacks, just what fits best
                Config.AttackSkill = [-1, necroSkillUntimed, necroSkillTimed, necroSkillUntimed, necroSkillTimed, -1, -1];

                Config.Curse[0] = Presets.skill.LowerResist;
                Config.Curse[1] = Presets.skill.LowerResist;

                Config.ExplodeCorpses = this.bestSkill([Presets.skill.CorpseExplosion, Presets.skill.PoisonExplosion]);

                if (this.getIronGolem()) {
                    Config.Golem = false; // Dont use any Golem if we detected a Iron Golem
                } else {
                    switch (this.bestSkill([Presets.skill.FireGolem, Presets.skill.BloodGolem, Presets.skill.ClayGolem])) {
                        case Presets.skill.FireGolem:
                            Config.Golem = "Fire";
                            break;
                        case Presets.skill.BloodGolem:
                            Config.Golem = "Blood";
                            break;
                        case Presets.skill.ClayGolem:
                            Config.Golem = "Clay";
                            break;
                        default:
                            Config.Golem = false;
                    }
                }
                acPrint('Golem? ' + Config.Golem);

                Config.PoisonNovaDelay = 2;
                Config.ActiveSummon = activeSummoner;
                Config.ReviveUnstackable = true;
                Config.IronGolemChicken = 40;
                break;
            case Team.RoleType.EleDruid:
                // Start off with a twister, after that spam Tornado's
                Config.AttackSkill = [Presets.skill.Twister, Presets.skill.Tornado, -1, Presets.skill.Tornado, -1, -1, -1];

                Config.SummonRaven = false; // Why should you. Yeah they blind monsters but precasting takes forever
                Config.SummonSpirit = "Oak Sage"; // Do you want any other?
                switch (this.bestSkill([Presets.skill.Grizzly, Presets.skill.DireWolf, Presets.skill.SpiritWolf])) {
                    case Presets.skill.Grizzly:
                        Config.SummonAnimal = "Grizzly";
                        break;
                    case Presets.skill.DireWolf:
                        Config.SummonAnimal = "Dire Wolf";
                        break;
                    case Presets.skill.SpiritWolf:
                        Config.SummonAnimal = "Spirit Wolf";
                        break;
                    default:
                        Config.SummonAnimal = '';
                }
                acPrint('SummonAnimal? ' + Config.SummonAnimal);

                switch (this.bestSkill([Presets.skill.SolarCreeper, Presets.skill.CarrionVine, Presets.skill.PoisonCreeper])) {
                    case Presets.skill.PoisonCreeper:
                        Config.SummonVine = "Poison Creeper";
                        break;
                    case Presets.skill.CarrionVine:
                        Config.SummonVine = "Carrion Vine";
                        break;
                    case Presets.skill.SolarCreeper:
                        Config.SummonVine = "Solar Creeper";
                        break;
                    default:
                        Config.SummonVine = false;
                        break;
                }
                acPrint('SummonVine? ' + Config.SummonVine);

                break;
            case Team.RoleType.Blizzy:
                // Spam blizzard ans iceblasts. Sorc's are easy to config. Imumns we handle with static and a good merc
                Config.AttackSkill = [Presets.skill.StaticField, Presets.skill.Blizzard, Presets.skill.IceBlast, Presets.skill.Blizzard, Presets.skill.IceBlast, Presets.skill.StaticField, -1];
                break;
            case Team.RoleType.Hammerdin:
                // Hammerdins are easy, just hammers and some holybolt its a undead magic imum
                Config.AttackSkill = [-1, Presets.skill.BlessedHammer, Presets.skill.Concentration, Presets.skill.BlessedHammer, Presets.skill.Concentration, Presets.skill.HolyBolt, -1];
                break;
            case Team.RoleType.LightSorc:
                // Spam lighting like crazy.
                Config.AttackSkill = [Presets.skill.ChainLightning, Presets.skill.Lightning, Presets.skill.ChainLightning, Presets.skill.Lightning, Presets.skill.ChainLightning, -1, -1];
                break;
            case Team.RoleType.Smiter:
                // Smiter, same as an hammerdin. Easy to setup. Aura and skill.
                Config.AttackSkill = [-1, Presets.skill.Smite, Presets.skill.Fanaticism, Presets.skill.Smite, Presets.skill.Fanaticism, -1, -1];
                break;

        }
        this.printAttack();
        acPrint('AvoidDolls? ' + Config.AvoidDolls);
        acPrint('RejuvBuffer? ' + Config.RejuvBuffer);

    },
    print: function (what,who) {
        print('\xffc4XPRuns - '+who+'\xffc0: ' + what);
    }

};


// Todo, blood mana (curse) from Hell Witch check
var Baal = {
    meLeader: false,
    inBaalrun: false,   // Handy to know
    currentWave: 0,     // Current wave
    tick: 0,
    preattack_x: 0,
    preattack_y: 0,
    throneSafe: false,
    checkThrone: function () {
        var monster = getUnit(1);

        if (monster) {
            do {
                // Is monster in the throne, or in entrance of throne
                if (Attack.checkMonster(monster)
                    && (( monster.y > 5002 && monster.y < 5073
                        && monster.x > 15072 && monster.x < 15118)
                        || (monster.y > 5073 && monster.y < 5096
                            && monster.x > 15088 && monster.x < 15103))) {
                    switch (monster.classid) {
                        case 23:
                        case 62:
                            return 1;
                        case 105:
                        case 381:
                            return 2;
                        case 557:
                            return 3;
                        case 558:
                            return 4;
                        case 571:
                            return 5;
                        default:

                            // Ingore monsters if they throne is ready already
                            if (!Team.isWeak) {
                                Attack.getIntoPosition(monster, 10, 0x4);
                                XPRunAttack.clear(15);
                            } else {
                            }
                            return false;
                    }
                }
            } while (monster.getNext());
        }

        return false;
    },
    clearThrone: function () {
        var i, monster,
            monList = [],
            pos = [15094, 5022, 15094, 5041, 15094, 5060, 15094, 5041, 15094, 5022];
        if (Team.isWeak) {
            return true;
        }


        if (Config.AvoidDolls) {
            monster = getUnit(1, 691);

            if (monster) {
                do {
                    if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && Attack.checkMonster(monster) && Attack.skipCheck(monster)) {
                        monList.push(copyUnit(monster));
                    }
                } while (monster.getNext());
            }

            if (monList.length) {
                Attack.clearList(monList);
            }
        }

        for (i = 0; i < pos.length; i += 2) {
            Pather.moveTo(pos[i], pos[i + 1]);
            XPRunAttack.clear(30);
        }
        return true;
    },
    run: function () {
        this.dupeTP = function () {
            // We are the one that tele's to mephisto? Dont TP
            if (Team.myMephistoType === Team.MephistoType.Tele && Team.Mephisto) {
                return;
            }

            // We are the one that tele's to Nihlathak? Dont TP
            if (Team.myNihlathakType === Team.NihlathakType.Tele && Team.Nihlathak) {
                return;
            }


            // We are the one that tele's to Dia? Dont dupe TP
            if (Team.myDiabloType === Team.DiabloType.Tele && Team.Diablo) {
                return
            }

            // Dupe tp
            Pather.makePortal();
        };
        this.getToThrone = function () {
            switch (Team.myBaalType) {
                case Team.BaalType.Tele: // This char gonna teleport to baal?

                    Town.goToTown(); // Go to town
                    Town.doChores(); // Do chores

                    // If we first do baal, its needed to bo
                    Pather.useWaypoint(Area.WorldstoneLvl2, true); // We just finished doing dia, go to WorldStone2
                    Precast.doPrecast(true);

                    if (!Pather.moveToExit([Area.WorldstoneLvl3, Area.ThroneOfDestruction], true)) {
                        print("Failed to move to throne.");
                        return false;
                    }

                    Pather.moveTo(Presets.BaalPortalSpot[0], Presets.BaalPortalSpot[1]);

                    // Any portal here to Harrogath?
                    if (!Pather.getPortal(Area.Harrogath, null)) {
                        this.meLeader = true;
                        Pather.makePortal();
                        Precast.doPrecast(true);
                    } else {
                        this.dupeTP(); // Create an portal, if we dont tele to any other bosses
                    }

                    return true;
                case Team.BaalType.Helper:
                    var i, portal;
                    if (me.area < Area.ChoasSanctuary) {
                        Town.goToTown(4);
                        Util.fastAct4to5();
                    }
                    Town.goToTown(5); // should be in act 5 now, but you never know
                    Town.doChores();
                    Town.move("portalspot");
                    for (i = 0; i < Settings.BaalPortalWait; i += 1) {
                        portal = Pather.getPortal(131, null);
                        if (portal) {
                            print('Portal Owner:' + portal.getParent());

                            if (Team.isWeak) {
                                // We get a msg from our leader once the tp is safe
                                while (!this.throneSafe) {
                                    Team.sendMsgLeader('baal', Team.msgTypes.TpSafeQuestion);
                                    delay(1000);
                                }
                            }

                            Pather.usePortal(131, null);
                            break;
                        }
                        delay(1000);
                    }
                    if (i === Settings.BaalPortalWait) {
                        print("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
                        return false;
                    }

                    this.dupeTP(); // Create an portal, if we dont tele to any other bosses
                    return true;
                default: // Not doing baal
                    this.inBaalrun = false;
                    return false;
            }
        };

        this.waves = function () {

            // Weaker chars need to clear out for hydra's
            this.checkHydra = function () {
                var monster = getUnit(1, "hydra");

                if (monster) {
                    do {
                        if (monster.mode !== 12 && monster.getStat(172) !== 2) {
                            // Weak char?
                            if (Team.isWeak) {
                                Pather.moveTo(15118, 5002)
                            }

                            while (monster.mode !== 12) {
                                delay(500);

                                if (!copyUnit(monster).x) {
                                    break;
                                }
                            }

                            break;
                        }
                        delay(50);
                    } while (monster.getNext());
                }

                return true;
            };

            // Spawn all kinds of stuff while we wait for the wave to come
            this.preattack = function (wave, counter) {
                // Get out of party
                switch (Team.myRoleType) {
                    case Team.RoleType.Blizzy:
                        return Skill.cast(59, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1)); // cast blizzard
                        break;

                    case Team.RoleType.CurseNecro:
                        if (wave === 3) {
                            return Skill.cast(71, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1)) // cast dim vision
                        } else {
                            return Skill.cast(91, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1)) // cast lower resist
                        }
                        Skill.cast(67, 0, 15094, 5028); // spam teeth

                        break;

                    case Team.RoleType.Hammerdin: // Paladin
                        Skill.setSkill(113, 0); // Set Concentration
                        Skill.cast(112, 1); // Spam hammers
                        break;
                    case Team.RoleType.Warcry:
                        if (counter > 2e3) {
                            return false;
                        }
                        while (!this.checkThrone()) {
                            Skill.cast(154, 0); // cast war cry
                            delay(200);
                        }
                        break;
                    case Team.RoleType.EleDruid: // Druid
                        switch (wave) {
                            case 3:
                                Pather.moveTo(15093, 5020);
                                Skill.cast(245, 0, 15094 + rand(-7, +7), 5028);
                                break;
                            case 1:
                                Config.SummonRaven = true; // summon ravens from here on
                            default:
                                Skill.cast(240, 0, 15094 + rand(-1, 1), 5028);
                                break
                        }
                        break;
                    case Team.RoleType.Trapsin: // Assassin
                        Skill.cast(Config.AttackSkill[3], 0, 15094, 5028);
                        break;
                    case Team.RoleType.LightSorc:
                        Skill.cast(Presets.skill.ChainLightning, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1)); // cast charged bolt

                }

                return false;
            };

            // Called just once a wave is spawned by Baal. Like cloak of shadows or special attack
            this.spawnCast = function (wave) {
                switch (Team.myRoleType) {
                    case Team.RoleType.JavaZon:
                        if (wave === 3) {
                            Skill.cast(17); // slow missile
                        }
                        // Spawn 3 Lighting furys, but only if wave isn't done
                        for(i = 0; i < 3 && this.checkThrone(); i += 1) {
                            Skill.cast(Presets.skill.LightningFury,undefined,15086,5020)
                        }
                        break;
                        break;
                    case Team.RoleType.LightSorc: // Sorceress
                    case Team.RoleType.Blizzy: // Sorceress
                        if (!Team.isWeak) {
                            print('Casting static first');
                            Pather.moveTo(15094, 5029); // Tele to the middle
                            Skill.cast(42, 0, me.x, me.y);
                            Pather.moveTo(15094, 5038); // Tele back to the side
                        }
                        break;
                    case Team.RoleType.CurseNecro: // Necro
                        if (wave === 3) {
                            Skill.cast(71, 0, 15094, 5028) // Dim vision, prevents hydra
                        } else {
                            Skill.cast(91, 0, 15094, 5028) // Lower resist
                        }
                        break;
                    case Team.RoleType.Trapsin: // Assassin
                        if ([3, 4, 5].indexOf(wave) !== -1) {
                            Skill.cast(264, 0, 15094, 5028); // cloak of shadows
                        }
                        break;
                    case Team.RoleType.Warcry:
                        Skill.cast(154, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1)); // cast war cry
                }

                /**
                 if (wave === 2 && Chars.BaalPartyLeaver.indexOf(me.windowtitle)){
                    // Someone needs to leave the party and it seems to be me.
                    Party.leaveparty();
                }**/

                return true;
            };

            // Do certain stuff like replacing the traps after a wave
            this.postCast = function (wave) {
                var i;
                switch (Team.myRoleType) {
                    case Team.RoleType.Trapsin: // Assassin
                        // Place traps again
                        var i;
                        for (i = 0; i < 5; i += 1) {
                            Skill.cast(271, 0, 15090 + (i * 2), 5035);
                        }
                        break;
                    case Team.RoleType.Warcry:
                        // Give everyone a bo, to avoid stupid people with cta
                        Precast.doPrecast(true);
                        break;
                }
                /*
                if (wave === 2 && Chars.BaalPartyLeaver.indexOf(me.windowtitle)){
                    // I left the party, need to rejoin it again
                    Party.rejoinparty();
                }*/
            };

            this.moveToPreattack = function () {
                if (getDistance(me, this.preattack_x, this.preattack_y) > 3) {
                    print(this.preattack_x + ',' + this.preattack_y);
                    Pather.moveTo(this.preattack_x, this.preattack_y);
                }
            };

            // Get the position of a char
            var wave;
            if (!Team.isWeak) {
                this.preattack_x = Presets.BaalDefault[0];
                this.preattack_y = Presets.BaalDefault[1];
                switch (Team.myRoleType) {
                    case Team.RoleType.LightSorc:
                        this.preattack_x = 15092;
                        this.preattack_y = 5043;
                        break;
                    case Team.RoleType.JavaZon: // Since far cast is patched, we stand in the middle (need a strong char for that)
                    case Team.RoleType.EleDruid:
                    case Team.RoleType.Warcry:
                    case Team.RoleType.Smiter:
                    case Team.RoleType.Hammerdin:
                        this.preattack_x = Presets.BaalWaveSpawn[0];
                        this.preattack_y = Presets.BaalWaveSpawn[1];
                        break;
                }
            } else {
                this.preattack_x = 15108;
                this.preattack_y = 5043;
            }

            this.throneSafe = true;
            if (Team.isLeader) {
                Team.sendMsg('baal', Team.msgTypes.TpSafe);
            }

            this.moveToPreattack();

            this.postCast(); // Replace traps / barb bo's and such
            while (true) {
                if (!getUnit(1, 543)) {
                    // This sadly have sometimes some false positives. So move to preattack place and check again
                    this.moveToPreattack();
                    if (!getUnit(1, 543)) {
                        return true; // Baal's really gone.
                    }
                }
                delay(25);
                wave = this.checkThrone();
                if (wave > 0 && wave < 6) {
                    this.currentWave = wave;
                    print('In wave ' + wave + '. Time: ' + (12200 - (getTickCount() - this.tick)));
                    this.spawnCast(wave); // Cast something when wave just came
                    XPRunAttack.clear(30);
                    switch (wave) {
                        case 3:
                            this.checkHydra();
                            break;
                        case 5:
                            SpareTime.BaalWave(wave); // Need to do stuff?
                            return true; // Done
                    }
                    this.tick = getTickCount();
                    SpareTime.BaalWave(wave); // Need to do stuff?
                    this.moveToPreattack();
                    this.postCast(wave);
                    Precast.doPrecast(false);

                } else {
                    this.moveToPreattack();
                    var counter = 8000 - (getTickCount() - this.tick);
                    switch (true) {
                        case (counter < 3e3):
                            this.preattack(this.currentWave + 1, counter);
                            break;
                    }

                }

            }
        };
        this.killBaal = function () {
            var portal;
            print('Time to kill baal');
            if (me.area !== Area.WorldstoneChamber) {
                Pather.moveTo(15092, 5011);
                Precast.doPrecast(false);

                while (getUnit(1, 543)) {
                    delay(500);
                }

                delay(500);

                Pather.moveTo(15092, 5011);


                portal = getUnit(2, 563);

                if (portal) {
                    Pather.usePortal(null, null, portal);
                } else {
                    throw new Error("Couldn't find portal.");
                }
            }
            Pather.moveTo(15151, 5946);
            this.dupeTP();
            Attack.kill(544); // Baal
            Pickit.pickItems();

            switch (true) {
                case Team.Nihlathak:
                case Team.Mephisto:
                case (Team.Diablo && Team.baalFirst):
                    Team.usePortal(Area.Harrogath);
                    print('Done 2');
                    break;
                default:
                    if (Config.FieldID) {
                        Town.fieldID(); // Saves time in ng
                    }
                    delay(1000);
                    quit();
            }
            this.inBaalrun = false;
            return true;

        };

        if (!Team.Baal) {
            return false; // don't do baal
        }
        this.inBaalrun = true;

        print('Doing a baalrun!');
        if (!this.getToThrone()) {
            return false;
        }

        // Clear around tp portal
        XPRunAttack.clear(15);

        this.clearThrone();
        var waves;
        waves = this.waves();
        if (!waves) {
            return false; // baal seems to be bugged and don't give any new monsters
        }


        return this.killBaal();
    },

};

var XPRunAttack = {
    clear: function (range, spectype, bossId, sortfunc, pickit, leaderName, recursive) { // probably going to change to passing an object
        this.getLeaderUnit = function (name) {
            var player = getUnit(0, name);

            if (player) {
                do {
                    if (!player.dead) {
                        return player;
                    }
                } while (player.getNext());
            }

            return false;
        };
        if (recursive === undefined) {
            recursive = 0;
        }
        if (recursive === 10) {
            return false;
        }
        if (range === undefined) {
            range = 25;
        }

        if (spectype === undefined) {
            spectype = 0;
        }

        if (bossId === undefined) {
            bossId = false;
        }

        if (sortfunc === undefined) {
            if (me.area === Area.ChoasSanctuary) {
                // Closeby first, speed optimisation so the team runs the same
                sortfunc = function (unitA, unitB) {
                    return getDistance(me, unitA) - getDistance(me, unitB)
                };
            } else {
                sortfunc = Attack.sortMonsters;
            }
        }

        if (pickit === undefined) {
            pickit = true;
        }

        if (leaderName === undefined) {
            leaderName = false;
        }

        var i, boss, orgx, orgy, target, result, monsterList, start, oldmsg,
            gidAttack = [],
            attackCount = 0;

        if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
            return false;
        }

        orgx = me.x;
        orgy = me.y;


        monsterList = [];
        target = getUnit(1);

        if (target) {
            do {
                if ((!spectype || (target.spectype & spectype)) && Attack.checkMonster(target) && Attack.skipCheck(target)) {
                    // Speed optimization - don't go through monster list until there's at least one within clear range

                    // Baal check, Be sure in throne we only clear *in* the chamber of the throne, not outside it
                    /*if ( me.area !== Area.ThroneOfDestruction || (me.area === Area.ThroneOfDestruction  && (( target.y > 5002 && target.y < 5073
                            && target.x > 15072 && target.x < 15118)
                            || (target.y > 5073 && target.y < 5096
                                && target.x > 15088 && target.x < 15103)))) {*/

                    if (!start && getDistance(target, orgx, orgy) <= range &&
                        (me.getSkill(54, 1) || !Scripts.Follower || !checkCollision(me, target, 0x1))) {
                        start = true;
                    }
                    monsterList.push(copyUnit(target));
                    //}
                }
            } while (target.getNext());
        }
        oldmsg = Msg.action;
        while (start && monsterList.length > 0 && attackCount < 300 && !(Msg.action === 'stop' && oldmsg === 'following')) {
            if (me.dead) {
                return false;
            }

            monsterList.sort(sortfunc);

            target = copyUnit(monsterList[0]);

            //* if ( me.area !== Area.ThroneOfDestruction || (me.area === Area.ThroneOfDestruction  && (( target.y > 5002 && target.y < 5073
            //        && target.x > 15072 && target.x < 15118)
            //        || (target.y > 5073 && target.y < 5096
            //            && target.x > 15088 && target.x < 15103)))) {


            //} else {
            //    // Ingore monsters outside of the throne
            //    monsterList.shift();
            //    continue;
            //}

            if (target.x !== undefined && (getDistance(target, orgx, orgy) <= range || (Attack.getScarinessLevel(target) > 7 && getDistance(me, target) <= range)) && Attack.checkMonster(target)) {
                if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
                    Attack.deploy(target, Config.DodgeRange, 5, 9);
                }

                Misc.townCheck(true);
                me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

                var corpse;
                // Some class specifics
                switch (Team.myRoleType) {
                    case Team.RoleType.CurseNecro:
                        corpse = getUnit(1, -1, 12);
                        if (corpse) {
                            do {
                                if (getDistance(me, corpse) <= range && this.checkCorpse(corpse)) { // within casting distance
                                    this.explodeCorpses(corpse);
                                }
                            } while (corpse.getNext());
                        }
                        break;

                }
                result = ClassAttack.doAttack(target, attackCount % 15 === 0);

                if (result) {
                    for (i = 0; i < gidAttack.length; i += 1) {
                        if (gidAttack[i].gid === target.gid) {
                            break;
                        }
                    }

                    if (i === gidAttack.length) {
                        gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
                    }

                    gidAttack[i].attacks += 1;
                    attackCount += 1;

                    // Desync/bad position handler
                    switch (Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) {
                        case 112:
                            //print(gidAttack[i].name + " " + gidAttack[i].attacks);

                            // Tele in random direction with Blessed Hammer
                            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
                                //print("random move m8");
                                Pather.moveTo(me.x + rand(-1, 1) * 5, me.y + rand(-1, 1) * 5);
                            }

                            break;
                        default:
                            // Flash with melee skills
                            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
                                Packet.flash(me.gid);
                            }

                            break;
                    }

                    // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
                    if (me.area !== Area.ThroneOfDestruction && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
                        print("�c1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
                        monsterList.shift();
                    }

                    if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
                        Pickit.fastPick();
                    }
                } else {
                    monsterList.shift();
                }
            } else {
                monsterList.shift();
            }
            oldmsg = Msg.action;
        }

        ClassAttack.afterAttack(pickit);
        if (attackCount > 0 && pickit) {
            Pickit.pickItems();
        }

        return true;
    },

    checkCorpse: function (unit) {
        if (unit.mode !== 12) {
            return false;
        }

        if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
            !unit.getState(1) && // freeze
            !unit.getState(96) && // revive
            !unit.getState(99) && // redeemed
            !unit.getState(104) && // nodraw
            !unit.getState(107) && // shatter
            !unit.getState(118) // noselect
        ) {
            return true;
        }

        return false;
    },
    explodeCorpses: function (unit) {
        if (Config.ExplodeCorpses === 0 || unit.mode === 0 || unit.mode === 12) {
            return false;
        }

        var i,
            corpseList = [],
            range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3),
            corpse = getUnit(1, -1, 12);

        if (corpse) {
            do {
                if (getDistance(unit, corpse) <= range && this.checkCorpse(corpse)) {
                    corpseList.push(copyUnit(corpse));
                }
            } while (corpse.getNext());

            //Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
            if (corpseList.length > 1) {
                corpseList = corpseList.shuffle();
            }

            if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
                // We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
                do {
                    corpse = corpseList.shift();

                    if (corpse) {
                        if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
                            me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid); // Added corpse ID so I can see when it blows another monster with the same ClassID and Name

                            if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
                                delay(me.ping + 1);
                            }
                        }
                    }
                } while (corpseList.length > 0);
            } else {
                // We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
                for (i = 0; i <= 1; i += 1) {
                    if (corpseList.length > 0) {
                        corpse = corpseList.shift();

                        if (corpse) {
                            me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

                            if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
                                delay(200);
                            }
                        }
                    } else {
                        break;
                    }
                }
            }
        }

        return true;
    },

};

var SpareTime = {
    BaalWave: function (wave) {
        this.ThroneToTown = function () {
            return (Pather.getPortal(Area.Harrogath, null) && Pather.usePortal(Area.Harrogath, null));
        };
        this.toThrone = function () {
            this.getPortal = function (area) {
                var portal = getUnit(2, "portal");
                if (portal) {
                    do {
                        if (portal.getParent() !== me.name && portal.objtype === area) {
                            return portal;
                        }

                    } while (portal.getNext());
                }
                return false;
            };
            if (me.area < Area.Harrogath) {
                // Not in act 5
                Town.goToTown(4);
                Util.fastAct4to5();
            }
            Town.goToTown(5); // just to be sure
            Town.move("portalspot");

            var portal;
            // Find portal that isn't from me.
            portal = this.getPortal(Area.WorldstoneChamber); // Worldstone chamber up?
            if (!portal) {
                portal = this.getPortal(Area.ThroneOfDestruction);
            }

            if (portal) {
                return Pather.usePortal(null, null, portal);
            }
            // In case it didn't find any other portal as mine, take another back
            return (Pather.getPortal(Area.ThroneOfDestruction, null) && Pather.usePortal(Area.ThroneOfDestruction, null)
                || (Pather.getPortal(Area.WorldstoneChamber, null) && Pather.usePortal(Area.WorldstoneChamber, null)));
        };
        switch (wave) {
            case 1:
            case 2:
            case 3:
                // Posioned and we are weak? Heal in town
                if (me.getState(2) && Team.isWeak) {
                    this.ThroneToTown();
                    Town.initNPC("Heal", "heal");
                    me.cancel();
                    this.toThrone();
                }
                break;
            case 5:
                this.ThroneToTown();
                var done = true;
                switch (true) {
                    case Team.myNihlathakType === Team.NihlathakType.Tele && Team.Nihlathak:
                        Nihlathak.init(); // Tele now for later
                        break;
                    case Team.myMephistoType === Team.MephistoType.Tele && Team.Mephisto:
                        Mephisto.init(); // Tele now for later
                        break;
                    case Team.myDiabloType === Team.DiabloType.Tele && Team.Diablo:
                        Diablo.init();
                        break;
                    default:
                        done = false;
                }
                if (!done) {
                    Town.doChores();
                }
                this.toThrone();
                break;
        }

    }
};

var Diablo = {
    inDiarun: false,


    // Called once we want to go to the throne.
    init: function () {
        if (!Team.Diablo) {
            return false; // Not doing diablo, why tele to him?
        }
        var portal, i;
        switch (Team.myDiabloType) {
            case Team.DiabloType.Tele:
                print('Teling to Diablo');
                Town.doChores();


                // Check first if tp is up already
                Pather.useWaypoint(Area.PandemoniumFortress);
                portal = Pather.getPortal(Area.ChoasSanctuary, null);
                if (portal && Pather.usePortal(Area.ChoasSanctuary, null)) {
                    print('Already a portal cast, take this directly');
                    if (portal.getParent() === me.name) {
                        // It was my portal, re init it.
                        Pather.makePortal();
                    }
                } else {
                    Pather.useWaypoint(Area.RiverOfFlame, true);
                    // Tele to entrance
                    if (!Pather.moveTo(7791, 5293)) {
                        throw new Error("Failed to move to Chaos Sanctuary");

                    }
                    // We are planning to do a fast dia? get layout to tele to vizier
                    if (Team.DiabloFast) {
                        var position_x, position_y, layout = this.getLayout()
                        position_x = layout === 1 ? 7662 : 7662; //
                        position_y = layout === 1 ? 5293 : 5314; //
                        if (!Pather.moveTo(position_x, position_y)) {
                            throw new Error("Failed to move to vizier");
                        }
                    } else {
                        // Tele to star
                        if (!Pather.moveTo(7791, 5293)) {
                            throw new Error("Failed to move to star");
                        }
                    }
                    Pather.makePortal(Baal.inBaalrun); // Use it once made if we are in a baalrun

                    // Teling here from wave 5
                    if (Baal.inBaalrun) {
                        Team.DontCastTp = true;
                        Team.DontCastTpReason = 'Diablo';
                        return true;
                    }
                }
                break;

            case Team.DiabloType.Helper:
                Town.doChores();
                Town.goToTown(4);
                Town.move("portalspot");
                print('Waiting for portal');

                for (i = 0; i < (Settings.DiabloPortalWait * 2); i += 1) {
                    portal = Pather.getPortal(Area.ChoasSanctuary, null);
                    if (portal) {
                        Pather.usePortal(null, null, portal);
                        break;
                    }
                    delay(500);
                }
                break;
        }
        if (Team.baalFirst) {
            // We come from a baalrun, its about time to precast
            Precast.doPrecast(true);
        }
    },
    run: function () {

        // Sort function
        this.sort = function (a, b) {
            if (Config.BossPriority) {
                if ((a.spectype & 0x5) && (b.spectype & 0x5)) {
                    return getDistance(me, a) - getDistance(me, b);
                }

                if (a.spectype & 0x5) {
                    return -1;
                }

                if (b.spectype & 0x5) {
                    return 1;
                }
            }

            // Entrance to Star / De Seis
            if (me.y > 5325 || me.y < 5260) {
                if (a.y > b.y) {
                    return -1;
                }

                return 1;
            }

            // Vizier
            if (me.x < 7765) {
                if (a.x > b.x) {
                    return -1;
                }

                return 1;
            }

            // Infector
            if (me.x > 7825) {
                if (!checkCollision(me, a, 0x1) && a.x < b.x) {
                    return -1;
                }

                return 1;
            }

            return getDistance(me, a) - getDistance(me, b);
        };

        // general functions
        this.getLayout = function (seal, value) {
            var sealPreset = getPresetUnit(108, 2, seal);

            if (!seal) {
                throw new Error("Seal preset not found. Can't continue.");
            }

            if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
                return 1;
            }

            return 2;
        };

        this.initLayout = function () {
            this.vizLayout = this.getLayout(396, 5275);
            this.seisLayout = this.getLayout(394, 7773);
            this.infLayout = this.getLayout(392, 7893);
        };

        this.openSeal = function (classid) {
            var i, seal, warn;

            switch (classid) {
                case 396:
                case 394:
                case 392:
                    warn = true;

                    break;
                default:
                    warn = false;

                    break;
            }

            for (i = 0; i < 5; i += 1) {
                Pather.moveToPreset(me.area, 2, classid, 2, 0);

                seal = getUnit(2, classid);

                if (!seal) {
                    return false;
                }

                if (seal.mode) { // for pubbies
                    if (warn) {
                        say(Config.Diablo.SealWarning);
                    }

                    return true;
                }

                warn = false;

                seal.interact();
                delay(classid === 394 ? 1000 : 500);

                if (!seal.mode) {
                    if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) { // de seis optimization
                        Pather.moveTo(seal.x + 15, seal.y);
                    } else {
                        Pather.moveTo(seal.x - 5, seal.y - 5);
                    }

                    delay(500);
                } else {
                    return true;
                }
            }

            return false;
        };

        this.chaosPreattack = function (name, amount) {
            var i, n, target, positions;

            switch (me.classid) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    target = getUnit(1, name);

                    if (!target) {
                        return;
                    }

                    positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

                    for (i = 0; i < positions.length; i += 1) {
                        if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) { // check if we can move there
                            Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
                            Skill.setSkill(Config.AttackSkill[2], 0);

                            for (n = 0; n < amount; n += 1) {
                                Skill.cast(Config.AttackSkill[1], 1);
                            }

                            break;
                        }
                    }

                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 6:
                    break;
            }
        };

        this.getBoss = function (name) {
            var i, boss,
                glow = getUnit(2, 131);

            for (i = 0; i < Team.isLeader ? 16 : 38; i += 1) {
                boss = getUnit(1, name);

                if (boss) {
                    this.chaosPreattack(name, 8);

                    return Attack.clear(40, 0, name, this.sort);
                }

                delay(250);
            }

            return !!glow;
        };

        this.vizierSeal = function () {

            if (!Team.isLeader) {
                Util.startFollow();
                this.preAttack('viz');
            } else {
                print("Viz layout " + this.vizLayout);
                this.followPath(this.vizLayout === 1 ? this.starToVizA : this.starToVizB);

                Util.stopFollow(); // Let the followers know we are done

                print('Open the seals');
                if (!this.openSeal(396) || !this.openSeal(395)) {
                    throw new Error("Failed to open Vizier seals.");
                }
                // The entire team does this
                if (this.vizLayout === 1) {
                    Pather.moveTo(7691, 5292);
                } else {
                    Pather.moveTo(7695, 5316);
                }
            }


            if (!this.getBoss(getLocaleString(2851))) {
                throw new Error("Failed to kill Vizier");
            }


            return true;
        };

        this.preAttack = function (id) {
            switch (id) {
                case 'viz':
                    print('Preattacking viz');
            }
        };

        this.seisSeal = function () {
            if (!Team.isLeader) {
                Util.startFollow();
            } else {
                print("Seis layout " + this.seisLayout);
                this.followPath(this.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);

                Util.stopFollow();
                if (!this.openSeal(394)) {
                    throw new Error("Failed to open de Seis seal.");
                }

            }

            if (this.seisLayout === 1) {
                Pather.moveTo(7771, 5196);
            } else {
                Pather.moveTo(7798, 5186);
            }

            if (!this.getBoss(getLocaleString(2852))) {
                throw new Error("Failed to kill de Seis");
            }

            return true;
        };

        this.infectorSeal = function () {
            if (!Team.isLeader) {
                Util.startFollow();
            } else {

                print("Inf layout " + this.infLayout);
                this.followPath(this.infLayout === 1 ? this.starToInfA : this.starToInfB);

                if (!this.openSeal(392)) {
                    throw new Error("Failed to open Infector seals.");
                }
                Util.stopFollow();
            }

            if (this.infLayout === 1) {
                delay(1);
            } else {
                Pather.moveTo(7928, 5295); // temp
            }

            if (!this.getBoss(getLocaleString(2853))) {
                throw new Error("Failed to kill Infector");
            }
            if (!Team.isLeader) {
                if (!this.openSeal(393)) {
                    throw new Error("Failed to open Infector seals.");
                }
            }

            return true;
        };

        this.diabloPrep = function () {
            var trapCheck,
                tick = getTickCount();

            while (getTickCount() - tick < 30000) {
                if (getTickCount() - tick >= 8000) {
                    switch (me.classid) {
                        case 1: // Sorceress
                            if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
                                if (me.getState(121)) {
                                    delay(500);
                                } else {
                                    Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
                                }

                                break;
                            }

                            delay(500);

                            break;
                        case 3: // Paladin
                            Skill.setSkill(Config.AttackSkill[2]);
                            Skill.cast(Config.AttackSkill[1], 1);

                            break;
                        case 5: // Druid
                            if (Config.AttackSkill[1] === 245) {
                                Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);

                                break;
                            }

                            delay(500);

                            break;
                        case 6: // Assassin
                            if (Config.UseTraps) {
                                trapCheck = ClassAttack.checkTraps({x: 7793, y: 5293});

                                if (trapCheck) {
                                    ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, trapCheck);

                                    break;
                                }
                            }

                            delay(500);

                            break;
                        default:
                            delay(500);

                            break;
                    }
                } else {
                    delay(500);
                }

                if (getUnit(1, 243)) {
                    return true;
                }
            }

            throw new Error("Diablo not found");
        };

        this.followPath = function (path) {
            var i;

            for (i = 0; i < path.length; i += 2) {


                Pather.moveTo(path[i], path[i + 1], 3, getDistance(me, path[i], path[i + 1]) > 50);
                Attack.clear(30, 0, false, this.sort);

                // Push cleared positions so they can be checked for strays
                this.cleared.push([path[i], path[i + 1]]);

                // After 5 nodes go back 2 nodes to check for monsters
                if (i === 10 && path.length > 16) {
                    path = path.slice(6);
                    i = 0;
                }
            }
        };

        this.defendPlayers = function () {
            var player,
                oldPos = {x: me.x, y: me.y},
                monster = getUnit(1);

            if (monster) {
                do {
                    if (Attack.checkMonster(monster)) {
                        player = getUnit(0);

                        if (player) {
                            do {
                                if (player.name !== me.name && getDistance(monster, player) < 30) {
                                    me.overhead("defending players");
                                    Pather.moveToUnit(monster);
                                    Attack.clear(15, 0, false, this.sort);
                                }
                            } while (player.getNext());
                        }
                    }
                } while (monster.getNext());
            }

            if (getDistance(me, oldPos.x, oldPos.y) > 5) {
                Pather.moveTo(oldPos.x, oldPos.y);
            }

            return true;
        };

        this.cleared = [];

        // path coordinates
        this.entranceToStar = [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7791, 5293];
        this.starToVizA = [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314];
        this.starToVizB = [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284];
        this.starToSeisA = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7814, 5169, 7788, 5153];
        this.starToSeisB = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7774, 5160, 7803, 5154];
        this.starToInfA = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5295, 7919, 5290];
        this.starToInfB = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5274, 7927, 5275, 7932, 5297, 7923, 5313];


        if (!Team.Diablo || !Team.myDiabloType) {
            Team.sync('Diablo');
            print('not doing a dia run');
            return false;
        }
        print('Doing a dia run');
        this.inDiarun = true;

        Team.sync('Diablo');
        // Fast Dia spawns us @ vizier, normal dia at the star
        this.init();


        this.initLayout();
        if (Team.isLeader && !Team.DiabloFast) {
            Attack.clear(30, 0, false, this.sort);
        }
        this.vizierSeal();
        this.seisSeal();
        Precast.doPrecast(true);
        this.infectorSeal();

        switch (me.classid) {
            case 1:
                Pather.moveTo(7792, 5294);

                break;
            default:
                Pather.moveTo(7788, 5292);

                break;
        }


        this.diabloPrep();
        Attack.kill(243); // Diablo
        Pickit.pickItems();

        return true;


    },
};

var Mephisto = {
    // Called after wave 5.
    init: function () {
        if (!Team.Mephisto || Team.myMephistoType === 0) {
            return;
        }
        print('Teling to mephisto in the time we have before doing baal');
        Town.goToTown();
        Town.heal();
        Pather.useWaypoint(Area.KurastDocktown);
        if (Pather.getPortal(Area.DuranceOfHateLevel3, null)) {
            print('Already a portal cast');
            return true; // Someone already made a portal @ dura 3
        }
        Pather.useWaypoint(Area.DuranceOfHateLevel2); // Go to dura 2
        Precast.doPrecast(true);
        if (!Pather.moveToExit(Area.DuranceOfHateLevel3, true)) {
            Town.goToTown();
            return false;
        }
        Pather.moveTo(17566, 8069); // Move to in front of the portal
        if (!Pather.makePortal() && !Pather.usePortal(null, me.name)) {
            throw new Error("Town.goToTown: Failed to take TP");
        }
        Team.DontCastTp = true;
        Team.DontCastTpReason = 'Mephisto';
        return true;
    },

    run: function () {
        this.goToMeph = function () {
            var portal;
            Pather.useWaypoint(Area.KurastDocktown);
            Pather.moveTo(5160, 5066);
            portal = Pather.getPortal(Area.DuranceOfHateLevel3, null);
            if (!portal) {
                print('Couldnt found portal to Dura');
                Town.goToTown(4);
                return false;
            }
            Team.sync('Mephisto');
            if (portal.getParent() === me.name) {
                Pather.usePortal(null, null, portal);
                return Pather.makePortal();
            } else {
                return Pather.usePortal(null, null, portal);
            }
        };
        this.takeRedPortal = function () {
            Pather.moveTo(17590, 8068);
            delay(1500);
            Pather.moveTo(17601, 8070);
            Pather.usePortal(null);
        };
        if (!Team.Mephisto || Team.myMephistoType === 0) {
            print('Not doing a meph run')
            return false;
        }
        print('Mephisto run!');
        if (!this.goToMeph()) {
            return false;
        }
        Attack.kill(242); // Mephisto
        Pickit.pickItems();
        // take the red portal to act 4
        this.takeRedPortal();
        return true;

    }

};

var Nihlathak = {
    preattack: function() {
        var target,i;
        for (i = 0; !target && i < 5; i += 1) {
            if (i!==0) { delay(200);}
            target = getUnit(1, 526);
        }
        switch(Team.myRoleType) {
            case Team.RoleType.JavaZon:
                for (i=0;i<3;i+=1) {
                    Skill.cast(Presets.skill.LightningFury, 0, target.x, target.y); // Spam a lightingfury
                }
                break;
            case Team.RoleType.LightSorc:
                for (i=0;i<3;i+=1) {
                    Skill.cast(Presets.skill.ChainLightning, 0, target.x, target.y); // Spam a chainlightingt
                }

        }

    },
    run: function () {
        // Don't do any town chores.
        // We want that everyone joins quickly after a baalrun the portal. So do lighting quick Nihlathak
        Town.heal();
        Team.sync('Nihlathak');
        if (Team.myNihlathakType === 0 || !Team.Nihlathak || Team.isWeak) {
            print('Not doing a Nihlathak run');
            return false; // We are not involved with the Nihlathak run
        }
        print('Doing a Nihlathak run');
        Town.goToTown(5); // Make sure, 100% sure, we are in act5.. should be, but just to be sure
        Town.move("portalspot");
        if (Pather.getPortal(Area.HallsOfVaught, me.name)) {
            print('My Portal');
            // The portal to nihlathak is mine. Wait a second before entering it.
            Team.DontCastTp = false;
            Team.DontCastTpReason = '';
            delay(1500);
            Pather.usePortal(124, null);
            Pather.makePortal(); // remake the portal for others to enter
        } else {
            print('Trying to enter portal of Nihlathak')
            if (Pather.getPortal(Area.HallsOfVaught, null)) {
                Pather.usePortal(Area.HallsOfVaught, null);
            }
        }
        if (me.area !== Area.HallsOfVaught) {
            return false; // Failed Halls of Vaught
        }
        // We are in the Nihlathak's place. Kill him
        //XPRunAttack.clear(20);
        Attack.kill(526); // Nihlathak
        Pickit.pickItems();
        switch (true) {
            case Team.Mephisto: // If baalisn't first, this is the last we do
            case Team.Diablo && Team.BaalType: // Diablo comes after nithak, if we did baal first
                Team.usePortal(Area.Harrogath); // Go back to town.
                return true;
            default:
                delay(1000);
                quit(); // Done!;

        }


    },
    init: function () {
        print('Go to nithak');
        Town.goToTown(); // Go to town.
        Town.heal(); // only heal, no time for the full shopping
        if (me.area !== Area.Harrogath) {
            Pather.useWaypoint(Area.Harrogath); // return quickly to act 5 to see if any portal is up
        }
        if (Pather.getPortal(124, null)) {
            return true; // Someone already made a portal @ nihlathak's hiding place
        }
        Pather.useWaypoint(Area.HallsOfPain); // use the waypoint
        Precast.doPrecast(false);
        if (!Pather.moveToExit(Area.HallsOfVaught, true)) {
            return false;
        }
        // Move to nihlathak.
        Pather.moveToPreset(me.area, 2, 462, 0, 0, false); // Skip last teleport to have a tp relativly close by
        Attack.getIntoPosition(getUnit(1, 526), 10, 0x4);

        // Someone already put his/her's portal here?
        if (Pather.getPortal(Area.Harrogath, null) && Pather.usePortal(Area.Harrogath, null)) {
            // If so, use it and go back to town. Don't need to set a portal
            return false; // We already check for this. However in the time we tele'd, someone could beat us ofcourse
        }

        if (!Pather.makePortal() && !Pather.usePortal(null, me.name)) {
            throw new Error("Town.goToTown: Failed to take TP");
        }
        Team.DontCastTp = true;
        Team.DontCastTpReason = 'Nihlathak';
        return true;
    }
};

function XPRun() {
    addEventListener("copydata", function (mode, msg) {
        if (mode < 100) {
            return;
        }
        //print("msg: " + msg + " mode: " + mode); //debug
        var obj;
        switch (mode) {
            case Team.msgTypes.action:
                Msg.action = msg;
                break;

            ////////////////////////
            // follower -> leader //
            ////////////////////////

            case Team.msgTypes.pong:                // Follower->Leader received a pong from a follower
                Msg.ping += 1;
                break;

            case Team.msgTypes.getLocation:         // Folower->Leader doesn't know the location anymore of the leader
                //if (!sendCopyData(null, muleObj.muleProfile, 10, JSON.stringify({profile: me.profile, mode: this.torchAnniCheck || 0}))) {
                Team.sendMsg(JSON.stringify({x: me.x, y: me.y, area: me.area}), Team.msgTypes.Location);
                break;

            case Team.msgTypes.TpSafeQuestion:      // Follower-> Leader. Tp safe yet?
                switch (msg) {
                    case 'baal': // Baal, aka throne
                        if (Baal.throneSafe) {
                            Team.sendMsg('baal', Team.msgTypes.TpSafe);
                        }
                        break;
                }
            ////////////////////////
            // Leader -> follower //
            ////////////////////////
            case Team.msgTypes.TpSafe:              // Leader -> follower, tp is safe
                switch (msg) {
                    case 'baal':
                        Baal.throneSafe = true;
                        break;
                }

            case Team.msgTypes.ping:                // Leader->Follower received a ping from leader
                if (Msg.pong === 1 && Msg.seed === msg) { //ready
                    Team.sendMsgLeader(Msg.seed, Team.msgTypes.pong); //pong
                }
                break;

            case Team.msgTypes.syncDone:            // Leader->follower received a msg that syncing is done
                if (Msg.seed === msg) {
                    Msg.seed = '';
                }
                break;

            case Team.msgTypes.Location:            // Leader->Follower coords

                obj = JSON.parse(msg);
                print(msg);
                Msg.x = obj.x;
                Msg.y = obj.y;
                Msg.area = obj.area;
                break;

            case Team.msgTypes.stopFollow:          // Leader->Follower stop following the bot
                Msg.action = 'stop';
                break;

            case Team.msgTypes.config:
                obj = JSON.parse(msg);
                //Team.others.settings[]
                print(obj.toString());


        }
    });
    addEventListener('gameevent', function (mode, param1, param2, name1, name2) {
        switch (mode) {
            case 0x02: // Someone joined game


            // Yep no break here, its on purpose
            case 0x00: // "%Name1(%Name2) dropped due to time out."
            case 0x01: // "%Name1(%Name2) dropped due to errors."
            case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
                Team.updateTime = true;
                break;
        }
    });


    Team.init();
    if (Team.baalFirst) {
        //print('Baal->Nihlathak->Mephisto->Dia');
        Baal.run();
        Nihlathak.run();
        Mephisto.run();
        Diablo.run(); // Ends in act4;
    } else {
        //print('Dia->Baal->Nihlathak->Mephisto');
        Diablo.run();
        Baal.run();
        Nihlathak.run();
        Mephisto.run(); // Ends in act4
    }
    delay(1000); // Just come in act 4. Wait a second
    Team.sync('EndGame');

}
