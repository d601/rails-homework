class AppointmentsController < ApplicationController
  def index
    @appointments = Appointment.all
  end
  
  def new
  end

  def create
    # Time should probably be sanitized - or does rails do that automatically?
    post_data = params[:appointment]

    @appointment = Appointment.new
    @appointment.description = post_data[:description]

    begin
      @appointment.time = DateTime.new(Integer(post_data[:year]),
                                      Integer(post_data[:month]),
                                      Integer(post_data[:day]),
                                      Integer(post_data[:hour]),
                                      Integer(post_data[:minute]))
    rescue ArgumentError
      render json: "error"
      return
    end

    if @appointment.save
      render json: @appointment, status: :created, location: @appointment
    else
      render json: @appointment.errors, status: :unprocessable_entity
    end
  end

  def show
    render text: "incomplete"
  end

  private
    def appointment_params
      # params.permit(:year, :month, :day, :hour, :minute, :description)
      # params.require(:appointment).permit(:time, :description)
    end
end
