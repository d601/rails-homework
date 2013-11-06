class AppointmentsController < ApplicationController
  def index
    @appointments = if params[:start] and params[:end]
                      Appointment.where(time: params[:start]..params[:end])
                    else
                      Appointment.all
                    end

    render json: @appointments
  end
  
  def new
  end

  def create
    # Time should probably be sanitized - or does rails do that automatically?
    post_data = params[:appointment]

    @appointment = Appointment.new

    begin
      @appointment.description = post_data[:description]
      @appointment.time = DateTime.new(Integer(post_data[:year]),
                                      Integer(post_data[:month]),
                                      Integer(post_data[:day]),
                                      Integer(post_data[:hour]),
                                      Integer(post_data[:minute]))
      redirect_to @appointment if @appointment.save

    rescue ArgumentError
      render json: @appointment.errors, status: :unprocessable_entity
    end

  end

  def show
    render json: Appointment.find(params[:id])
  end

  private
    def appointment_params
      # params.permit(:year, :month, :day, :hour, :minute, :description)
      # params.require(:appointment).permit(:time, :description)
    end
end
