
// B"H

/**
 * @file vehicle.js
 * @description
 * Base vehicle class.
 *
 * Narrow fix:
 * vehicle.js must not participate in a Chai circular initialization crash.
 *
 * The real issue came from the Olam boot path importing a broad barrel export,
 * which pulled too many Chai descendants while Chai was still initializing.
 * OlamVessel now imports Nivra directly, but this file is also made safer:
 *
 * - no top-level prototype grafting
 * - no barrel imports
 * - only direct Chai import
 * - constructor protects options object
 */

import Chai from "../../chayim/chai/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * B"H
 * Vehicle, a living movable vessel.
 */
export default class Vehicle extends Chai {
  type = "vehicle";
  driver = null;
  isVehicle = true;
  seatOffset = new THREE.Vector3(0, 0.5, 0);

  /**
   * B"H
   * Creates a vehicle.
   *
   * @param {Object} op
   * Vehicle options.
   *
   * @param {Object} olam
   * World instance.
   */
  constructor(op = {}, olam) {
    op.isSolid = true;
    op.interactable = true;

    super(op, olam);

    this.speed = 0;
    this.maxSpeed = 50;

    this.on("accepted interaction", player => {
      if (!this.driver) {
        this.mount(player);
      }
    });
  }

  /**
   * B"H
   * Mounts a player into the vehicle.
   *
   * @param {Object} player
   * Player.
   *
   * @returns {void}
   */
  mount(player) {
    this.driver = player;

    player.isDriving = true;
    player.drivingVehicle = this;

    if (player.mesh) {
      player.mesh.visible = true;
    }

    if (player.velocity && typeof player.velocity.set === "function") {
      player.velocity.set(0, 0, 0);
    }

    if (this.olam?.ayin) {
      this.olam.ayin.target = this;
      this.olam.ayin.desiredDistance = 10;
    }

    this.ayshPeula("ui event", "effectsOverlay", {
      text: "Mounted " + this.name,
      color: "#00ff00"
    });
  }

  /**
   * B"H
   * Dismounts current driver.
   *
   * @returns {void}
   */
  dismount() {
    if (!this.driver) return;

    const player = this.driver;
    player.isDriving = false;
    player.drivingVehicle = null;

    const exitPos = this.mesh.position
      .clone()
      .add(new THREE.Vector3(2, 2, 0).applyQuaternion(this.mesh.quaternion));

    player.setPosition(exitPos);

    if (player.velocity && typeof player.velocity.set === "function") {
      player.velocity.set(0, 5, 0);
    }

    if (this.olam?.ayin) {
      this.olam.ayin.target = player;
    }

    this.driver = null;
    this.speed = 0;
  }

  /**
   * B"H
   * Per-frame update.
   *
   * @param {number} dt
   * Delta time.
   *
   * @returns {void}
   */
  heesHawvoos(dt) {
    if (this.driver) {
      this.handleInput(dt);
    } else {
      this.speed *= 0.95;
      if (Math.abs(this.speed) < 0.1) {
        this.speed = 0;
      }
    }

    this.applyPhysics(dt);

    if (this.driver) {
      this.syncDriver();
    }

    super.heesHawvoos(dt);
  }

  /**
   * B"H
   * Syncs driver position to seat.
   *
   * @returns {void}
   */
  syncDriver() {
    if (!this.driver || !this.mesh) return;

    const seatPos = this.seatOffset
      .clone()
      .applyQuaternion(this.mesh.quaternion)
      .add(this.mesh.position);

    this.driver.setPosition(seatPos);
    this.driver.rotation.y = this.mesh.rotation.y;

    if (this.driver.mesh) {
      this.driver.mesh.rotation.copy(this.mesh.rotation);
    }

    if (this.driver.playChaweeyoos) {
      this.driver.playChaweeyoos("idle");
    }
  }

  /**
   * B"H
   * Handles default vehicle input.
   *
   * @param {number} dt
   * Delta time.
   *
   * @returns {void}
   */
  handleInput(dt) {
    const inputs = this.olam?.inputs || {};

    if (inputs.FORWARD) {
      this.speed = Math.min(this.maxSpeed, this.speed + 30 * dt);
    } else if (inputs.BACKWARD) {
      this.speed = Math.max(-this.maxSpeed / 2, this.speed - 30 * dt);
    } else {
      this.speed *= 0.98;
    }

    if (Math.abs(this.speed) > 0.5) {
      const turnSpeed = 2.0 * (this.speed / this.maxSpeed);

      if (inputs.LEFT_ROTATE) {
        this.rotation.y += turnSpeed * dt;
      }

      if (inputs.RIGHT_ROTATE) {
        this.rotation.y -= turnSpeed * dt;
      }
    }
  }

  /**
   * B"H
   * Applies simple forward velocity.
   *
   * @param {number} dt
   * Delta time.
   *
   * @returns {void}
   */
  applyPhysics(dt) {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);

    this.velocity.x = forward.x * this.speed;
    this.velocity.z = forward.z * this.speed;
  }
}
